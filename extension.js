/** Author: Eimji (Patrick)
/** Email: eimji.hvp@gmail.com
/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

'use strict';

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
//const Util = imports.misc.util;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Panel = imports.ui.panel;
const Config = imports.misc.config;

const ExtensionUtils = imports.misc.extensionUtils;
const MyExtension = ExtensionUtils.getCurrentExtension();
const ScrollablePopupMenu = MyExtension.imports.scrollablePopupMenu.ScrollablePopupMenu;
const ProxiesMenuItem = MyExtension.imports.proxiesMenuItem.ProxiesMenuItem;
const EditProxyDialog = MyExtension.imports.editProxyDialog;
const ConfirmDialog = MyExtension.imports.confirmDialog;
const Settings = MyExtension.imports.settings;

const SCHEMA_PATH = 'org.gnome.shell.extensions.scriptproxies';
const ACTIVE_PROXY = 'active-proxy';
const DEFAULT_EDITOR = 'default-editor';
const DEVELOPMENT = 'in-development';

const DisabledIcon = 'set-proxies-off-symbolic';
const EnabledIcon = 'set-proxies-on-symbolic';
const EditIcon = 'system-run-symbolic';

const AppDir = GLib.build_filenamev([global.userdatadir, 'extensions/scriptproxies@patrick.eimji.com']);
//const HomeDir = GLib.get_home_dir();


const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-shell-extensions-scriptproxies').gettext;

let _setproxies;



function strStartsWith(str, prefix) {
    return str.indexOf(prefix) === 0;
}

function strEndsWith(str, suffix) {
    return str.match(suffix + '$') == suffix;
}


const SetProxies = new Lang.Class({
    Name: 'SetProxies',
    Extends: PanelMenu.Button,

    _init: function() {
        this.parent(0.0, 'Set Proxies');

        // schema org.gnome.shell.extensions.com.eimji.setproxies for saving settings
        this._settings = Settings.getSettings(SCHEMA_PATH);
        this._activeProxy = this._settings.get_string(ACTIVE_PROXY);
        this._defaultEditor = this._settings.get_string(DEFAULT_EDITOR);
        this._inDevelopment = this._settings.get_boolean(DEVELOPMENT);

        this._settings.connect("changed::" + ACTIVE_PROXY, Lang.bind(this, function() {
            this._activeProxy = this._settings.get_string(ACTIVE_PROXY);
            this._updateMenu();
        }));


        this._icon = new St.Icon({
            icon_name: this._activeProxy == 'No proxy' ? DisabledIcon : EnabledIcon,
            icon_size: 19,
            style_class: 'setProxies-button'
        });

        this.actor.add_child(this._icon);


        this.popupMenu = new ScrollablePopupMenu(this.actor, St.Align.START, St.Side.TOP);
        this.setMenu(this.popupMenu);

        this._updateMenu();
    },

    destroy: function() {
        this.menu.removeAll();
        this.parent();
    },

    _updateMenu: function() {
        this.menu.removeAll();

        let app_dir = Gio.file_new_for_path(AppDir);
        let files = app_dir.enumerate_children(Gio.FILE_ATTRIBUTE_STANDARD_NAME, Gio.FileQueryInfoFlags.NONE, null);

        let file, fileName;
        while ((file = files.next_file(null))) {
            fileName = file.get_name();
            // name of a proxy script should be started with "set_" and ended with ".sh":
            // name format: set_My_Proxy_Name.sh, e.g. set_Orange_proxy.sh
            if (strStartsWith(fileName, 'set_') && strEndsWith(fileName, '.sh')) {
                let editButton = this._createButton(EditIcon);

                let proxyName = fileName.replace('set_', '').replace('.sh', '').replace('_', ' ');
                let newProxy = new ProxiesMenuItem(proxyName);
                newProxy.connect('activate', Lang.bind(this, function() {
                    this.menu.close();
                    if (this._activeProxy != proxyName)
                        try {
                            Main.Util.trySpawnCommandLine(AppDir + '/set_' + proxyName.replace(' ', '_') + '.sh');
                            this._icon.icon_name = EnabledIcon;
                            Main.notify(proxyName + _(' enabled'));
                            this._settings.set_string(ACTIVE_PROXY, proxyName);
                        } catch (err) {
                            Main.notify(_('Error when enabling ') + proxyName);
                        }
                    else
                        Main.notify(proxyName + _(' is already enabled'));
                }));

                newProxy.setOrnament(this._activeProxy == proxyName ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);

                editButton.connect('clicked', Lang.bind(this, function() {
                    this.menu.close();
                    this._launchEditProxyDialog('edit', proxyName);
                }));
                newProxy.actor.add(editButton);

                this.menu.addMenuItem(newProxy);
            }
        }


        let editNoProxyButton = this._createButton(EditIcon);
        let noProxy = new ProxiesMenuItem(_('No proxy'));

        noProxy.connect('activate', Lang.bind(this, function() {
            this.menu.close();
            if (this._activeProxy != 'No proxy')
                try {
                    Main.Util.trySpawnCommandLine(AppDir + '/unsetProxy.sh');
                    this._icon.icon_name = DisabledIcon;
                    Main.notify(_('Proxy disabled'));
                    this._settings.set_string(ACTIVE_PROXY, 'No proxy');
                } catch (err) {
                    Main.notify(_('Error when disabling proxy'));
                }
            else
                Main.notify(_('Proxy already disabled'));
        }));

        noProxy.setOrnament(this._activeProxy == 'No proxy' ? PopupMenu.Ornament.CHECK : PopupMenu.Ornament.NONE);

        editNoProxyButton.connect('clicked', Lang.bind(this, function() {
            try {
                Main.Util.trySpawnCommandLine(this._defaultEditor + ' ' + AppDir + '/unsetProxy.sh');

            } catch (err) {
                Main.notify(_('Error: text editor ') + this._defaultEditor + _(' not installed'));
                this._launchSetEditorDialog();
            }
            this.menu.close();
        }));
        noProxy.actor.add(editNoProxyButton);

        this.menu.addMenuItem(noProxy);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // TODO later: GUI for the configuration of the extension settings

        // for the moment, open a popup window to add a new proxy
        let addNewProxy = new PopupMenu.PopupMenuItem(_('New proxy'));
        addNewProxy.connect('activate', Lang.bind(this, function() {
            this._launchEditProxyDialog('add', '');
        }));

        this.menu.addMenuItem(addNewProxy);

        // This is only for development, for my own use.
        if (this._inDevelopment) {
            let proxyOpenFolder = new PopupMenu.PopupMenuItem(_('Open the folder'));
            proxyOpenFolder.connect('activate', Lang.bind(this, function() {
                Gio.app_info_launch_default_for_uri(MyExtension.dir.get_uri(), null);
            }));

            this.menu.addMenuItem(proxyOpenFolder);
        }

    },

    _launchEditProxyDialog: function(action, proxyName) {
        let editProxyDialog = new EditProxyDialog.EditProxyDialog(Lang.bind(this, function(userEnteredProxyName, type) {
            // in the extension folder, create a file named set_'User_entered_proxy_name'.sh
            let newProxyFile = AppDir + '/set_' + userEnteredProxyName.replace(' ', '_') + '.sh';
            let oldProxyFile = AppDir + '/set_' + proxyName.replace(' ', '_') + '.sh';

            if (type == 'new') {
                // add a new proxy

                if (userEnteredProxyName) {
                    Main.Util.trySpawnCommandLine('touch ' + newProxyFile);
                    try {
                        Main.Util.trySpawnCommandLine(this._defaultEditor + ' ' + newProxyFile);
                    } catch (err) {
                        Main.notify(_('Error: text editor ') + this._defaultEditor + _(' not installed'));
                        this._launchSetEditorDialog();
                    }
                    this._updateMenu();
                } else {
                    //user forgets to set a name for the new proxy 
                    // push an alert to the user!
                    let alertDialog = new ConfirmDialog.ConfirmDialog(_('Proxy title blank'), _('You forgot to set a name for your new proxy, do you want to start again?'), Lang.bind(this, function() {
                        this._launchEditProxyDialog('add', '');
                    }));
                    alertDialog.open();
                }

            } else if (type == 'rename') {
                // rename an existing proxy

                if (strEndsWith(newProxyFile, 'set_.sh')) {
                    // requires a confirmation from user before removing
                    let confirmDialog = new ConfirmDialog.ConfirmDialog(_('Confirm removal'), _('Do you want to delete ') + proxyName + _('?'), Lang.bind(this, function() {
                        Main.Util.trySpawnCommandLine('rm ' + oldProxyFile);
                        this._updateMenu();
                    }));
                    confirmDialog.open();

                } else {
                    if (newProxyFile != oldProxyFile) {
                        Main.Util.trySpawnCommandLine('mv ' + oldProxyFile + ' ' + newProxyFile);
                        this._updateMenu();
                    }
                }

            } else {
                // here type should 'modify': modify the shell script of an existing proxy
                try {
                    if (!strEndsWith(newProxyFile, 'set_.sh'))
                        Main.Util.trySpawnCommandLine(this._defaultEditor + ' ' + newProxyFile);
                    else
                        Main.Util.trySpawnCommandLine(this._defaultEditor + ' ' + oldProxyFile);

                } catch (err) {
                    Main.notify(_('Error: text editor ') + this._defaultEditor + _(' not installed'));
                    this._launchSetEditorDialog();
                }
            }
        }), action);

        if (action == 'edit')
        // edit a proxy
            editProxyDialog.open(proxyName);
        else
        // action == 'add': add a new proxy
            editProxyDialog.open('');
    },

    _launchSetEditorDialog: function() {
        let editProxyDialog = new EditProxyDialog.EditProxyDialog(Lang.bind(this, function(userEnteredProxyName) {
            this._settings.set_string(DEFAULT_EDITOR, userEnteredProxyName);
            this._defaultEditor = userEnteredProxyName;
        }), 'editor');

        editProxyDialog.open('');
    },

    _createButton: function(icon) {
        let button = new St.Button({
            child: new St.Icon({
                icon_name: icon,
                icon_size: 15
            }),
            style_class: 'edit-button',
            reactive: true,
            y_align: St.Align.MIDDLE,
            x_align: St.Align.END
        });
        return button;
    }
});



function init(extensionMeta) {

    let domain = MyExtension.metadata['gettext-domain'];

    let localeDir = MyExtension.dir.get_child('locale');
    if (localeDir.query_exists(null))
        Gettext.bindtextdomain(domain, localeDir.get_path());
    else
        Gettext.bindtextdomain(domain, Config.LOCALEDIR);


    let theme = imports.gi.Gtk.IconTheme.get_default();
    theme.append_search_path(extensionMeta.path + '/icons');
}

function enable() {
    _setproxies = new SetProxies();
    Main.panel.addToStatusArea('set-proxies', _setproxies, 2);
}

function disable() {
    _setproxies.destroy();
    _setproxies = null;
}
