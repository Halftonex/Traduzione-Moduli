Hooks.once('init', () => {
    console.log("Italian Modules Translation | Inizializzazione")
    game.italianTranslations = new ItalianTranslations();
    game.italianTranslations?.manageTranslation();
});

Hooks.once('ready', async () => {
    game.italianTranslations?.showDialog();
    game.italianTranslations?._torchAddLights();
});

class ItalianTranslations {

    constructor() {
        this.moduleId = "italian-modules-translation";
        this.showDialogSetting = "show-dialog";
        this.overrideLang = "lang-override";
        this.torchAddLights = "torch-lights";
        this._initSettings();
    }

    _initSettings() {
        game.settings.register(this.moduleId, this.showDialogSetting, {
            name: "Mostra Messaggio all'Avvio",
            hint: "Visualizza un messaggio all'avvio del mondo con la lista dei moduli attivi di cui è presente una traduzione.",
            default: true,
            type: Boolean,
            scope: "world",
            config: true
        });
        game.settings.register(this.moduleId, this.overrideLang, {
            name: "Sovrascrivere Italiano Predefinito",
            hint: "Sovrascrive le traduzioni in italiano già presenti nei moduli con quelle fornite da questo modulo.",
            default: false,
            type: Boolean,
            scope: "world",
            config: true,
            onChange: value => { SettingsConfig.reloadConfirm({ world: true }); }
        });
        if (game.system.id === 'dnd5e' && game.modules.get("torch")) {
            game.settings.register(this.moduleId, this.torchAddLights, {
                name: "Torch - D&D5e Fonti di Luce Addizionali",
                hint: "Aggiunge un file per le fonti di luce addizionali di D&D5e in italiano alle impostazioni di Torch. Utile se si ha il compendio Oggetti (SRD) tradotto in italiano.",
                default: false,
                type: Boolean,
                scope: "world",
                config: true,
                onChange: value => { SettingsConfig.reloadConfirm({ world: true }); }
            });
        }
    }

    _isDialogEnabled() {
        return game.settings.get(this.moduleId, this.showDialogSetting);
    }

    _hasItalian(languages) {
        return languages.some(language => language.lang === 'it')
    }    

    _disableDialog() {
        game.settings.set(this.moduleId, this.showDialogSetting, false)
    }

    _torchAddLights() {
        const torch = game.modules.get("torch");
        if (!torch || !torch.active || !game.settings.get(this.moduleId, this.torchAddLights)) return;
        game.settings.set("torch", "gameLightSources", `modules/${this.moduleId}/lang/torch/dnd5e_fonti_di_luce.json`);        
    }

    manageTranslation() {
        if (game.i18n.lang !== "it") return;

        const imt = game.modules.get(this.moduleId);
        const { languages = [] } = imt; 
        const ovrLanguages = [];

        for (const lang of languages) {
            const module = game.modules.get(lang.module);

            if (!module?.active) continue;

            if (game.settings.get(this.moduleId, this.overrideLang) || !this._hasItalian(module.languages)) {
                ovrLanguages.push(lang);
            }
        }

        imt.languages = ovrLanguages;
    }

    showDialog() {
        if (game.i18n.lang !== "it" || !this._isDialogEnabled()) return;

        const imt = game.modules.get(this.moduleId);
        const { languages = [] } = imt;

        const modules = languages
            .map(lang => game.modules.get(lang.module)?.title)
            .sort();

        if (modules.length === 0) return;

        let message = `
                    <p>Sono state applicate le traduzioni in Italiano sui seguenti moduli attivi:</p>
                    <ul style='overflow: auto; height: 300px'>
                        ${modules.map(module => `<li>${module}</li>`).join('')}
                    </ul>
                `;

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
