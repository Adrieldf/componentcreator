import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { LocalStorageService } from "./localStorageService";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "componentcreator" is now active!'
  );

  let disposable = vscode.commands.registerCommand(
    "componentcreator.createComponent",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("editor does not exist");
        return;
      }

      function lookForFolders(
        currentPath: string,
        folderList: string[],
        rootFolderName: string
      ) {
        let read = fs.readdirSync(currentPath, { withFileTypes: true });
        read.forEach((element) => {
          if (element.isDirectory() && element.name != "node_modules") {
            folderList.push(
              currentPath
                .substring(currentPath.lastIndexOf(rootFolderName))
                .concat("\\", element.name)
            );
            lookForFolders(
              currentPath.concat("\\", element.name),
              folderList,
              rootFolderName
            );
          }
        });
      }

      function saveComponentFolder() {
        let storageManager = new LocalStorageService(context.workspaceState);

        storageManager.setValue<string>("componentsFolder", "");

        let componentsFolder = storageManager.getValue<string>("componentsFolder");

        if(componentsFolder && componentsFolder != "" ){
          
        }
        var workspaceFolders = vscode.workspace.workspaceFolders;
        let folderList = Array<string>();
        if (workspaceFolders != null && workspaceFolders.length > 0) {
          const projectRoot = workspaceFolders[0].uri.fsPath;
          lookForFolders(
            projectRoot,
            folderList,
            projectRoot.substring(projectRoot.lastIndexOf("\\"))
          );
        }
        var baseComponentName = "";
        const quickPick = vscode.window.createQuickPick();
        if (folderList.length) {
          quickPick.items = folderList.map((label) => ({ label }));
          quickPick.onDidChangeSelection(([item]) => {
            if (item) {
              baseComponentName = item.label;
              quickPick.dispose();
            }
          });
          quickPick.onDidHide(() => quickPick.dispose());
          quickPick.show();
        }
      }

      //digitar o nome do componente a ser criado
      //copiar a pasta do componente selecionado e criar nova com o nome escrito
      //copiar os arquivos de dentro do componente base e criar novos substituindo o nome do antigo pelo novo aonde estiver no titulo e conteudo do arquivo
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
