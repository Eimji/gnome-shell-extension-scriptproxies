const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const Signals = imports.signals;
const St = imports.gi.St;

const MyExtension = imports.misc.extensionUtils.getCurrentExtension();
const MultiButtonDialog = MyExtension.imports.multiButtonDialog;

const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-shell-extensions-scriptproxies').gettext;

const ConfirmDialog = new Lang.Class({
    Name: 'ConfirmDialog',
    Extends: MultiButtonDialog.MultiButtonDialog,

    _init: function(title, question, callback) {
        let mappings = [
            new MultiButtonDialog.ButtonMapping(_('No'), Clutter.Escape, null),
            new MultiButtonDialog.ButtonMapping(_('Yes'), Clutter.Return, callback),
        ];
        this.parent(title, question, mappings);
    },
});
Signals.addSignalMethods(ConfirmDialog.prototype);
