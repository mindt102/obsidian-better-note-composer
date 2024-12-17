import { PluginSettingTab, Setting } from 'obsidian';
import BetterNoteComposerPlugin from 'main';


const REPLACEMENT_TEXT = {
	'link': 'Link', // The core plugin uses "Link to new file" but it doesn't make sense since the destination file can be an existing one
	'embed': 'Embed',
	'none': 'None',
	'same': 'Same as the core Note Composer',
};

export interface BetterNoteComposerSettings {
	replacementText: keyof typeof REPLACEMENT_TEXT;
	stayOnSourceFile: boolean;
}

export const DEFAULT_SETTINGS: BetterNoteComposerSettings = {
	replacementText: 'same',
	stayOnSourceFile: true,
};

export class BetterNoteComposerSettingTab extends PluginSettingTab {
	constructor(public plugin: BetterNoteComposerPlugin) {
		super(plugin.app, plugin);
	}
	
	display(): void {
		this.containerEl.empty();

		new Setting(this.containerEl)
			.setName('Text after extraction')
			.setDesc('What to show in place of the extracted text after extraction.')
			.addDropdown((dropdown) => {
				dropdown.addOptions(REPLACEMENT_TEXT)
					.setValue(this.plugin.settings.replacementText)
					.onChange(async (value: keyof typeof REPLACEMENT_TEXT) => {
						this.plugin.settings.replacementText = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl)
			.setName('Stay on source file')
			.setDesc('Stay on the source file after extraction.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.stayOnSourceFile)
					.onChange(async (value) => {
						this.plugin.settings.stayOnSourceFile = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
