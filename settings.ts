import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

declare class BetterPDFPlugin extends Plugin {
    settings: BetterPdfSettings;
}

export class BetterPdfSettings {
    fit_by_default: boolean = true;
    link_by_default: boolean = true;
}

export class BetterPdfSettingsTab extends PluginSettingTab {
    plugin: BetterPDFPlugin;

    constructor(app: App, plugin: BetterPDFPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Fit pages by default")
            .setDesc("When turned on, pages will be scaled to the view by default. Can be overridden using the 'fit' parameter")
            .addToggle(toggle => toggle.setValue(this.plugin.settings.fit_by_default)
                .onChange((value) => {
                    this.plugin.settings.fit_by_default = value;
                    this.plugin.saveData(this.plugin.settings);
                }));

        new Setting(containerEl)
            .setName("Link pages by default")
            .setDesc("When turned on, pages will be linked to their document by default. Can be overridden using the 'link' parameter")
            .addToggle(toggle => toggle.setValue(this.plugin.settings.link_by_default)
                .onChange((value) => {
                    this.plugin.settings.link_by_default = value;
                    this.plugin.saveData(this.plugin.settings);
                }));
    }
}