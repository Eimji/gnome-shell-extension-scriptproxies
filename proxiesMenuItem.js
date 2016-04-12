const Lang = imports.lang;
const PopupMenu = imports.ui.popupMenu;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Util = imports.misc.util;
const Gtk = imports.gi.Gtk;


const ProxiesMenuItem = new Lang.Class({
    Name: 'ProxiesMenuItem',
    Extends: PopupMenu.PopupBaseMenuItem,

    _init: function(name, params) {
        this.parent(params);

        this.label = new St.Label({ text: name });

        this.actor.label_actor = this.label;
        this.actor.add(this.label, { expand: true });


    }

});
