const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const ModalDialog = imports.ui.modalDialog;
const Signals = imports.signals;
const St = imports.gi.St;

const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-shell-extensions-scriptproxies').gettext;

const EditProxyDialog = new Lang.Class({
    Name: 'EditProxyDialog',
    Extends: ModalDialog.ModalDialog,

    _init: function(callback, action) {
        this.callback = callback;
        this.action = action;
        this.parent({
            styleClass: 'prompt-dialog'
        });


        let label, buttons;

        if (this.action == 'add') {
            buttons = [{
                label: _('Cancel'),
                action: Lang.bind(this, this._onCancelButton),
                key: Clutter.Escape
            }, {
                label: _('Add proxy'),
                action: Lang.bind(this, this._onOkButton)
            }];

            label = new St.Label({
                style_class: 'edit-proxy-dialog-label',
                text: _('Enter the name for the new proxy')
            });
        } else if (this.action == 'edit') {
            buttons = [{
                label: _('Cancel'),
                action: Lang.bind(this, this._onCancelButton),
                key: Clutter.Escape
            }, {
                label: _('Modify script'),
                action: Lang.bind(this, this._modifyButton)
            }, {
                label: _('Rename'),
                action: Lang.bind(this, this._renameButton)
            }];

            label = new St.Label({
                style_class: 'edit-proxy-dialog-label',
                text: _('Modify the proxy script.') + '\n' + _('Or rename it (leave blank to remove the proxy).')
            });

        } else {
            // this should be this.action == 'editor'
            buttons = [{
                label: _('Cancel'),
                action: Lang.bind(this, this._onCancelButton),
                key: Clutter.Escape
            }, {
                label: _('OK'),
                action: Lang.bind(this, this._onSetEditorButton)
            }];

            label = new St.Label({
                style_class: 'edit-proxy-dialog-label',
                text: _('To edit your proxy script,') + '\n' + _('please provide the binary name of your text editor.')
            });
        }

        this.contentLayout.add(label, {
            y_align: St.Align.START
        });

        let entry = new St.Entry({
            style_class: 'edit-proxy-dialog-entry'
        });
        entry.label_actor = label;

        this._entryText = entry.clutter_text;
        this.contentLayout.add(entry, {
            y_align: St.Align.START
        });
        this.setInitialKeyFocus(this._entryText);

        this.setButtons(buttons);

        this._entryText.connect('key-press-event', Lang.bind(this, function(o, e) {
            let symbol = e.get_key_symbol();
            if (symbol == Clutter.Return || symbol == Clutter.KP_Enter) {
                this._onOkButton();
            }
        }));
    },

    close: function() {
        this.parent();
    },

    _onCancelButton: function() {
        this.close();
    },

    _onOkButton: function() {
        this.callback(this._entryText.get_text(), 'new');
        this.close();
    },

    _modifyButton: function() {
        this.callback(this._entryText.get_text(), 'modify');
        this.close();
    },

    _renameButton: function() {
        this.callback(this._entryText.get_text(), 'rename');
        this.close();
    },

    _onSetEditorButton: function() {
        this.callback(this._entryText.get_text());
        this.close();
    },

    open: function(initialText) {
        if (initialText === null) {
            this._entryText.set_text('');
        } else {
            this._entryText.set_text(initialText);
        }

        this.parent();
    }
});
Signals.addSignalMethods(EditProxyDialog.prototype);
