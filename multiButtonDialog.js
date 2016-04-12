const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const ModalDialog = imports.ui.modalDialog;
const Signals = imports.signals;
const St = imports.gi.St;

const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-shell-extensions-scriptproxies').gettext;

const ButtonMapping = new Lang.Class({
    Name: 'ButtonMapping',
    label: null,
    key: null,
    action: null,

    _init: function(label, key, action) {
        this.label = label;
        this.key = key;
        this.action = action;
    }
});

const MultiButtonDialog = new Lang.Class({
    Name: 'MultiButtonDialog',
    Extends: ModalDialog.ModalDialog,
    question: null,
    title: null,

    _init: function(title, question, buttonMappings) {
        this.question = question;
        this.title = title;
        this.parent({
            styleClass: 'confirm-dialog'
        });

        let tlabel = new St.Label({
            style_class: 'confirm-dialog-title',
            text: this.title
        });
        this.contentLayout.add(tlabel, {
            x_align: St.Align.MIDDLE,
            y_align: St.Align.START
        });

        let label = new St.Label({
            style_class: 'confirm-dialog-label',
            text: this.question
        });
        this.contentLayout.add(label, {
            y_align: St.Align.MIDDLE
        });

        let buttons = [];
        for (let i in buttonMappings) {
            if (buttonMappings.hasOwnProperty(i)) {
                let mapping = buttonMappings[i];
                buttons.push({
                    label: mapping.label,
                    key: mapping.key,
                    action: Lang.bind(this, function() {
                        if (mapping.action !== null) {
                            mapping.action();
                        }
                        this.close();
                    })
                });
            }
        }

        this.setButtons(buttons);
    },
});
Signals.addSignalMethods(MultiButtonDialog.prototype);
