'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext} from 'vscode';
import { CobolWorkspace } from './cobol.workspace';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    const cobolWorkspace = new CobolWorkspace();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var organizeExtenssions = commands.registerCommand('cobolplugin.organizeExtenssions', function () {
        cobolWorkspace.fixWorkspaceFilesExtenssions();
    });
    var groupFilesByPrefix = commands.registerCommand('cobolplugin.groupfilesbyprefix', function () {
        cobolWorkspace.groupFilesByPrefix();
    });

    context.subscriptions.push(organizeExtenssions);
    context.subscriptions.push(groupFilesByPrefix);

}

// this method is called when your extension is deactivated
export function deactivate() {
}