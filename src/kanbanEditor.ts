import { v4 as uuidv4 } from 'uuid';
import * as vscode from 'vscode';
import { type Kanban, toJson } from './kanban/models/kanban';

const viewType = 'portable-kanban.edit';

export class KanbanEditorProvider implements vscode.CustomTextEditorProvider {
  public static register(context: vscode.ExtensionContext): vscode.Disposable {
    const provider = new KanbanEditorProvider(context);
    const providerRegistration = vscode.window.registerCustomEditorProvider(viewType, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    });
    return providerRegistration;
  }

  constructor(private readonly context: vscode.ExtensionContext) {}

  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    let initialized = false;

    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

    const updateWebview = async () => {
      await webviewPanel.webview.postMessage({
        type: 'update',
        title: document.uri.path.split('/')?.slice(-1)[0]?.replace('.kanban', ''),
        text: document.getText(),
      });
    };

    webviewPanel.webview.onDidReceiveMessage(
      async (e: {
        type: 'load' | 'edit' | 'info-message' | 'open';
        message?: string;
        url?: string;
        kanban?: Kanban;
      }) => {
        switch (e.type) {
          case 'load': {
            await updateWebview();
            break;
          }

          case 'edit': {
            if (!initialized) {
              initialized = true;
              return;
            }

            await this.updateTextDocument(document, e.kanban!);
            break;
          }

          case 'info-message': {
            await vscode.window.showInformationMessage(e.message!, {
              modal: false,
            });
            break;
          }

          case 'open': {
            await vscode.env.openExternal(vscode.Uri.parse(e.url!));
          }
        }
      }
    );
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'kanban.js'));
    const theme =
      vscode.workspace.getConfiguration().get<'dark' | 'light' | 'system' | undefined>('portable-kanban.theme') ??
      'system';
    const showDescription =
      vscode.workspace.getConfiguration().get<boolean>('portable-kanban.show-description') ?? true;
    const showTaskList = vscode.workspace.getConfiguration().get<boolean>('portable-kanban.show-task-list') ?? true;
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'assets', 'css', 'main.css'));
    const themeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        'assets',
        'css',
        theme === 'dark' ? 'dark.css' : theme === 'light' ? 'light.css' : 'system.css'
      )
    );
    const nonce = uuidv4();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: ${webview.cspSource}; style-src 'unsafe-inline' https://fonts.googleapis.com ${webview.cspSource}; font-src https://fonts.gstatic.com; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;800&display=swap" rel="stylesheet">
				<title>Portable Kanban</title>
        <link rel="stylesheet" nonce="${nonce}" href="${cssUri.toString()}">
        <link rel="stylesheet" nonce="${nonce}" href="${themeUri.toString()}">
			</head>
			<body>
        <script nonce="${nonce}">
          window.settings = {
            showDescription: ${showDescription},
            showTaskList: ${showTaskList},
          };
        </script>
				<div id="root">
				</div>
				<script nonce="${nonce}" src="${scriptUri.toString()}"></script>
			</body>
			</html>`;
  }

  private updateTextDocument(document: vscode.TextDocument, kanban: Kanban) {
    const text = toJson(kanban);

    if (document.getText() === text) {
      return;
    }

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), text);

    return vscode.workspace.applyEdit(edit);
  }
}
