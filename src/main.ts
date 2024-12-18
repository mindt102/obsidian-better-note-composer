import { Keymap, Plugin, TFile } from 'obsidian';
import { EditorView } from '@codemirror/view';

import { Extractor } from 'extract';
import { MarkdownFileChooserModal } from 'modals';
import { BetterNoteComposerEditorCommand } from 'commands';
import { BetterNoteComposerSettings, DEFAULT_SETTINGS, BetterNoteComposerSettingTab } from 'settings';
import { isHeading } from 'utils';

export default class BetterNoteComposerPlugin extends Plugin {
	settings: BetterNoteComposerSettings;
	extractor = new Extractor(this);

	async onload() {
		await this.loadSettings();
		await this.saveSettings();
		this.addSettingTab(new BetterNoteComposerSettingTab(this));

		this.registerCommands();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	private registerCommands() {
		const showModalAndRun = (srcFile: TFile, callback: (dstFile: TFile, evt: MouseEvent | KeyboardEvent) => any) => {
			new MarkdownFileChooserModal(this)
				.setFilter((file) => file !== srcFile)
				.suggestFiles()
				.then(callback);
		};

		const commands = [
			new BetterNoteComposerEditorCommand({
				id: 'extract-selection',
				name: 'Extract current selection...',
				checker: (editor, info) => {
					// @ts-ignore
					const cm: EditorView = editor.cm;
					const srcFile = info.file;
					return !!srcFile && !cm.state.selection.main.empty;
				},
				executor: (editor, info) => {
					const srcFile = info.file!;
					showModalAndRun(srcFile, (dstFile, evt) => {
						this.extractor.extractSelection(srcFile, editor, dstFile, Keymap.isModEvent(evt))
					});
				}
			}),
			new BetterNoteComposerEditorCommand({
				id: 'extract-heading',
				name: 'Extract this heading...',
				checker: (editor, info) => !!info.file,
				executor: (editor, info) => {
					const srcFile = info.file!;
					showModalAndRun(srcFile, (dstFile, evt) => {
						this.extractor.extractHeading(srcFile, editor, dstFile, Keymap.isModEvent(evt))
					});
				}
			}),
			new BetterNoteComposerEditorCommand({
				id: 'extract-heading-recursive',
				name: 'Extract this heading recursively...',
				checker: (editor, info) => {
					// @ts-ignore
					const cm: EditorView = editor.cm;
			        const currentLine = cm.state.doc.lineAt(cm.state.selection.main.anchor);
					let currentHeadingLine = cm.state.doc.line(currentLine.number);

					// Must click on the heading line to avoid matching with comments in a code block
					return !!info.file && isHeading(currentHeadingLine.text);
				},
				executor: (editor, info) => {
					const srcFile = info.file!;
					showModalAndRun(srcFile, (dstFile, evt) => {
						this.extractor.extractHeadingRecursive(srcFile, editor, dstFile, Keymap.isModEvent(evt))
					});
				}
			}),
		];

		commands.forEach((command) => this.addCommand(command.toCommand()));
		this.registerEvent(this.app.workspace.on('editor-menu', (menu, editor, info) => {
			commands.forEach((command) => command.onEditorMenu(menu, editor, info));
		}));
	}

	getReplacementText(): 'link' | 'embed' | 'none' {
		return this.settings.replacementText === 'same'
			// @ts-ignore
			? (this.app.internalPlugins.plugins['note-composer'].instance.options.replacementText ?? 'link')
			: this.settings.replacementText;
	}

	getStayOnSourceFile(): boolean {
		return this.settings.stayOnSourceFile;
	}

	getKeepHeading(): boolean {
		return this.settings.keepHeading;
	}

	getLinkToDestHeading(): boolean {
		return this.settings.linkToDestHeading;
	}

	getUseHeadingAsAlias(): boolean {
		return this.settings.useHeadingAsAlias;
	}
}
