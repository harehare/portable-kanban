import { Buffer } from 'node:buffer';
import * as vscode from 'vscode';
import { KanbanEditorProvider } from './kanbanEditor';
import { type Kanban } from './kanban/models/kanban';
import { uuid } from './kanban/utils';

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
        const initialKanban: Kanban = {
          lists: [
            {
              id: uuid(),
              title: 'Backlog',
              cards: [],
            },
            {
              id: uuid(),
              title: 'To Do',
              cards: [],
            },
            {
              id: uuid(),
              title: 'Doing',
              cards: [],
            },
            {
              id: uuid(),
              title: 'Done',
              cards: [],
            },
          ],
          archive: { lists: [], cards: [] },
          settings: {
            labels: [],
          },
        };
        const kanbanJson = Buffer.from(JSON.stringify(initialKanban, null, 2), 'utf8');
        await vscode.workspace.fs.writeFile(fileInfos, kanbanJson);
        await vscode.commands.executeCommand('vscode.openWith', fileInfos, 'portable-kanban.edit');
      } catch (error) {
        await vscode.window.showErrorMessage(`Cannot create file "${fileInfos.toString()}`);
        console.error('Cannot create file', error);
      }
    })
  );
}
