'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { commands, ExtensionContext } from 'vscode';
import { CobolWorkspace } from './cobol.workspace';
import { JCLProvider } from './jcl-provider';
import { COBOLProvider } from './cobol-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(ctx: ExtensionContext) {
    const cobolWorkspace = new CobolWorkspace();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var organizeFromFtp = commands.registerCommand('cobolplugin.organizeFromFtp', function () {
        cobolWorkspace.organizeFromFtp();
    });

    var organizeExtenssions = commands.registerCommand('cobolplugin.organizeExtenssions', function () {
        cobolWorkspace.fixFilesExtensions();
    });
    var groupFilesByPrefix = commands.registerCommand('cobolplugin.groupfilesbyprefix', function () {
        cobolWorkspace.groupFilesByPrefix();
    });
    var undoLastAction = commands.registerCommand('cobolplugin.undolastaction', function () {
        cobolWorkspace.undoLastAction();
    });

    ctx.subscriptions.push(organizeFromFtp);
    ctx.subscriptions.push(organizeExtenssions);
    ctx.subscriptions.push(groupFilesByPrefix);
    ctx.subscriptions.push(undoLastAction);

    JCLProvider.activate(ctx);
    COBOLProvider.activate(ctx);
    

}

// this method is called when your extension is deactivated
export function deactivate() {
}