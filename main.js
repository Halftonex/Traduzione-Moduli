Hooks.once('init', () => {
    game.italianTranslations = new ItalianTranslations();
});

Hooks.once('ready', async () => {
    game.italianTranslations?.showDialog();
});

class ItalianTranslations {

    constructor() {
        this.moduleId = "italian-modules-translation";
        this.showDialogSetting = "show-dialog";
        this._initSettings();
    }

    _initSettings() {
        game.settings.register(this.moduleId, this.showDialogSetting, {
            name: "Mostra Messaggio all'Avvio",
            hint: "Visualizza un messaggio all'avvio del mondo con la lista dei moduli attivi di cui è presente una traduzione",
            default: true,
            type: Boolean,
            scope: "world",
            config: true
        });
    }

    _isDialogEnabled() {
        return game.settings.get(this.moduleId, this.showDialogSetting);
    }

    _disableDialog() {
        game.settings.set(this.moduleId, this.showDialogSetting, false)
    }

    showDialog() {
        if(game.i18n.lang === "it" && this._isDialogEnabled()) {
            const modules = [];
            const languages = game.modules.get(this.moduleId)?.languages;
            for (const lang of languages) {
                let module = game.modules.get(lang.module);
                if(module?.active) {
                    modules.push(module.data.title);
                }
            }
            modules.sort();

            let message = "<p>Sono state applicate le traduzioni in Italiano sui seguenti moduli attivi:</p>" +
                "<ul style='overflow: auto; height: 300px'>";
            for (const module of modules) {
                message += `<li>${module}</li>`
            }
            message += "</ul>";

            new Dialog({
                title: "Traduzione Moduli",
                content: message,
                buttons: {
                    ok: { icon: '<i class="fas fa-check"></i>', label: "Ok" },
                    dont_remind: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Non mostrare più",
                        callback: this._disableDialog.bind(this)
                    }
                }
            }).render(true);
        }
    }
}
