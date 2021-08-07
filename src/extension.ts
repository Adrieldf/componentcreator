import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

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
		console.log("entrou no comando");
		var workspaceFolders = vscode.workspace.workspaceFolders;
		if(workspaceFolders != null && workspaceFolders.length > 0){
			const projectRoot = workspaceFolders[0].uri.fsPath;
      
			
		}


		var baseComponentName = "";
        //mostrar quickpick com a lista de componentes e selecionar um
        const quickPick = vscode.window.createQuickPick();
        var folders = vscode.workspace.workspaceFolders;
		
		var items = folders?.map((x) => ({ label: x.name }));
		
		console.log("itens: ", items);
     //  quickPick.items = items;
        quickPick.onDidChangeSelection(([item]) => {
          if (item) {
			  baseComponentName = item.label;
            quickPick.dispose();
          }
        });
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
        //digitar o nome do componente a ser criado
        //copiar a pasta do componente selecionado e criar nova com o nome escrito
        //copiar os arquivos de dentro do componente base e criar novos substituindo o nome do antigo pelo novo aonde estiver no titulo e conteudo do arquivo

        
      }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
