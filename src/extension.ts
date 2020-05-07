'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext, window, workspace, WorkspaceFolder, QuickPickOptions } from 'vscode';
import { CobolWorkspace } from './cobol.workspace';
// import { JCLProvider } from './jcl-provider';
import { COBOLProvider } from './cobol-language-provider/index';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(ctx: ExtensionContext) {
    const cobolWorkspace = new CobolWorkspace();
    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var organizeFromFtp = commands.registerCommand('cobolplugin.organizeFromFtp', async () => {
        try {
            const wrk = await chooseWorkspace({
                placeHolder: 'Chosse workspace folder to apply organizations by FTP download:',
            });
            cobolWorkspace.organizeFromFtp( wrk );
            
        } catch (error) {
            window.showErrorMessage(error);
        }        
    });
    
    var organizeExtenssions = commands.registerCommand('cobolplugin.organizeExtenssions', async () => {
        try {
            const wrk = await chooseWorkspace({
                placeHolder: 'Chosse workspace folder to apply extenssions organizations:',
            });
            await cobolWorkspace.fixFilesExtensions( wrk );
            
        } catch (error) {
            window.showErrorMessage(error);
        }        
    });
    var groupFilesByPrefix = commands.registerCommand('cobolplugin.groupfilesbyprefix', async () => {
        try {
            const wrk = await chooseWorkspace({
                placeHolder: 'Chosse workspace folder to apply grouping organizations:',
            });
            cobolWorkspace.groupFilesByPrefix( wrk );
            
        } catch (error) {
            window.showErrorMessage(error);
        }
    });
    var undoLastAction = commands.registerCommand('cobolplugin.undolastaction', async () => {
        try {
            const wrk = await chooseWorkspace({
                placeHolder: 'Chosse workspace folder to apply undo changes:',
            });
            cobolWorkspace.undoLastAction( wrk );
            
        } catch (error) {
            window.showErrorMessage(error);
        }
    });
    
    ctx.subscriptions.push(organizeFromFtp);
    ctx.subscriptions.push(organizeExtenssions);
    ctx.subscriptions.push(groupFilesByPrefix);
    ctx.subscriptions.push(undoLastAction);
    
    // JCLProvider.activate(ctx);
    COBOLProvider.activate(ctx);
    

}
function chooseWorkspace(quickPickOptions: QuickPickOptions): Promise<WorkspaceFolder>{
    return new Promise(async (resolve, reject) => {
        if(!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
            return reject('This function needs almost one openned folder in workspace!');
        }
    
        if(workspace.workspaceFolders.length === 1){
            return resolve(workspace.workspaceFolders[0]);
        }

        const wrkMap: any = {};
        const wrkNames:string[] = [];
        workspace.workspaceFolders.map((wrk) => { wrkNames.push(wrk.name); wrkMap[wrk.name] = wrk; });
    
        const selectedWorkspaceName = await window.showQuickPick(wrkNames, quickPickOptions);

        if(!selectedWorkspaceName) {
            return reject('Nothing selected!');
        }
        
        return resolve(wrkMap[selectedWorkspaceName]);
    
    });

}
// this method is called when your extension is deactivated
export function deactivate() {
}