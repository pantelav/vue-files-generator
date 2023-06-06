import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { generateTemplate } from './generateTemplate';

export interface IWebData {
  fileName: string[],
  mode: 'capi' | 'oapi',
  ts: boolean,
  scoped: boolean,
  css: 'css' | 'scss' | 'sass',
  ref: boolean,
  computed: boolean,
  reactive: boolean,
  onMounted: boolean,
  watch: boolean
}

export function activate (context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('vue-files-generator.createFile', (uri: vscode.Uri) => {
    const panel = vscode.window.createWebviewPanel(
      'myModal',
      'Create vue file',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
      }
    );
    fs.readFile(path.join(context.extensionPath, 'src', 'index.html'), (err, data) => {
      if (err) {
        vscode.window.showErrorMessage('Vue file generator error');
      } else {
        panel.webview.html = data.toString();
      }
    });

    panel.webview.onDidReceiveMessage(msg => {
      if (msg.command === 'getConfig') {
        try {
          const data = getDefaultConfig()
          panel.webview.postMessage({ command: 'config', data })
        } catch (error) {
          vscode.window.showInformationMessage('Config error')
        }
      }

      if (msg.command === 'closeWebView') {
        try {
          const webData: IWebData = msg.data;
          webData.fileName.forEach((name, idx) => {
            const filePath = path.join(uri.fsPath, name + '.vue');
            fs.writeFileSync(filePath, generateTemplate(webData), 'utf-8');
            if (idx === 0) {
              vscode.workspace.openTextDocument(filePath).then(document => {
                vscode.window.showTextDocument(document);
              });
            }
          })
          panel.dispose();
        } catch (error) {
          vscode.window.showErrorMessage('Vue file creation error');
        }
      }

      if (msg.command === 'setDefault') {
        try {
          const webData: IWebData = msg.data
          saveConfig(webData)
          getDefaultConfig()
        } catch (error) {
          vscode.window.showErrorMessage('Unexpected error');
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

export function deactivate () { }

function getDefaultConfig () {
  const config = vscode.workspace.getConfiguration('vueFilesGenerator')
  return config.get('settings')
}

function saveConfig(data:IWebData) {
  const { ['fileName']: omitted, ...configData } = data
  const config = vscode.workspace.getConfiguration('vueFilesGenerator')
  for (const [key, value] of Object.entries(configData)) {
    config.update(`settings.${key}`, value, vscode.ConfigurationTarget.Global)
  }
  vscode.window.showInformationMessage('Configuration saved')
}