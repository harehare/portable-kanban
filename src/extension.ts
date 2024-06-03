import * as vscode from 'vscode';
import { KanbanEditorProvider } from './kanbanEditor';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    KanbanEditorProvider.register(context),
    vscode.commands.registerCommand('portable-kanban.new', async () => {
      const fileInfos = await vscode.window.showSaveDialog({
        saveLabel: 'Create kanban',
        filters: {
          Kanban: ['kanban'],
        },
      });
      if (!fileInfos?.path.endsWith('.kanban')) {
        return;
      }

      try {
        await vscode.workspace.fs.writeFile(fileInfos, new Uint8Array());
        await vscode.commands.executeCommand('vscode.openWith', fileInfos, 'portable-kanban.edit');
      } catch (error) {
        await vscode.window.showErrorMessage(`Cannot create file "${fileInfos.toString()}`);
        console.error('Cannot create file', error);
      }
    })
  );
}
