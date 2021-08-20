import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { LocalStorageService } from "./localStorageService";

export function activate(context: vscode.ExtensionContext) {
  console.log(
    'Congratulations, your extension "componentcreator" is now active!'
  );
  let storageManager = new LocalStorageService(context.workspaceState);
  let disposable = vscode.commands.registerCommand(
    "componentcreator.createComponent",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage("editor does not exist");
        return;
      }

      saveComponentFolder();

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

      function saveComponentFolder(force?: boolean) {
        let componentsFolder =
          storageManager.getValue<string>("componentsFolder");

        if (componentsFolder && componentsFolder != "" && !force) {
          selectBaseComponent();
          return;
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
        const quickPick = vscode.window.createQuickPick();
        quickPick.title = "Select the components folder";
        if (folderList.length) {
          quickPick.items = folderList.map((label) => ({ label }));
          quickPick.onDidChangeSelection(([item]) => {
            if (item) {
              storageManager.setValue<string>("componentsFolder", item.label);
              quickPick.dispose();
              selectBaseComponent();
            }
          });
          quickPick.onDidHide(() => quickPick.dispose());
          quickPick.show();
        }
      }

      function selectBaseComponent() {
        var workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders != null && workspaceFolders.length > 0) {
          const projectRoot = workspaceFolders[0].uri.fsPath;
          const componentsFolder =
            storageManager.getValue<string>("componentsFolder");

          let componentsList = Array<string>();
          let completePath =
            projectRoot +
            componentsFolder.substring(componentsFolder.indexOf("\\", 1));
          let read = fs.readdirSync(completePath, { withFileTypes: true });
          read.forEach((element) => {
            if (element.isDirectory()) {
              componentsList.push(element.name);
            }
          });

          const quickPick = vscode.window.createQuickPick();
          quickPick.title = "Select the component to copy";
          if (componentsList.length) {
            quickPick.items = componentsList.map((label) => ({ label }));
            quickPick.onDidChangeSelection(([item]) => {
              if (item) {
                quickPick.dispose();
                getNewComponentName(item.label, completePath);
              }
            });
            quickPick.onDidHide(() => quickPick.dispose());
            quickPick.show();
          }
        }
      }

      function getNewComponentName(
        baseComponentName: string,
        completePath: string
      ) {
        const componentNameInput = vscode.window.createInputBox();
        componentNameInput.title = "Type the new component name";
        componentNameInput.onDidAccept(() => {
          createComponent(
            baseComponentName,
            componentNameInput.value,
            completePath
          );
          componentNameInput.hide();
        });
        componentNameInput.onDidHide(() => componentNameInput.dispose());
        componentNameInput.show();
      }

      function createComponent(
        baseComponentName: string,
        newComponentName: string,
        completePath: string
      ) {
        let baseFolderPath = completePath + "\\" + baseComponentName;
        let newFolderPath = completePath + "\\" + newComponentName;
        fs.mkdirSync(newFolderPath);

        let read = fs.readdirSync(baseFolderPath, { withFileTypes: true });
        read.forEach((baseItem) => {
          let newName =
            newFolderPath +
            "\\" +
            baseItem.name.replace(baseComponentName, newComponentName);
          fs.copyFileSync(baseFolderPath + "\\" + baseItem.name, newName);
          fs.readFile(newName, "utf8", function (err, data) {
            if (err) {
              return console.log(err);
            }
            const replacer = new RegExp(baseComponentName, "g");
            var result = data.replace(replacer, newComponentName);

            fs.writeFile(newName, result, "utf8", function (err) {
              if (err) return console.log(err);
            });
          });
        });
        vscode.window.showInformationMessage("Component created! :D");
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
