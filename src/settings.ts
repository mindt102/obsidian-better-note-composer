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
	keepHeading: boolean;
	linkToDestHeading: boolean;
}

export const DEFAULT_SETTINGS: BetterNoteComposerSettings = {
	replacementText: 'same',
	stayOnSourceFile: true,
	keepHeading: true,
	linkToDestHeading: true,
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
			
		new Setting(this.containerEl)
			.setName('Keep heading')
			.setDesc('Keep the heading of the source file after extraction.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.keepHeading)
					.onChange(async (value) => {
						this.plugin.settings.keepHeading = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(this.containerEl)
			.setName('Link to destination heading')
			.setDesc('Link to the destination heading after extraction if using the "Link" option.')
			.addToggle((toggle) => {
				toggle.setValue(this.plugin.settings.linkToDestHeading)
					.onChange(async (value) => {
						this.plugin.settings.linkToDestHeading = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
