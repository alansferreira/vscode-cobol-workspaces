'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
const cobol_workspace_1 = require("./cobol.workspace");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const cobolWorkspace = new cobol_workspace_1.CobolWorkspace();
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var organizeExtenssions = vscode_1.commands.registerCommand('cobolplugin.organizeExtenssions', function () {
        cobolWorkspace.fixWorkspaceFilesExtenssions();
    });
    var groupFilesByPrefix = vscode_1.commands.registerCommand('cobolplugin.groupfilesbyprefix', function () {
        cobolWorkspace.groupFilesByPrefix();
    });
    context.subscriptions.push(organizeExtenssions);
    context.subscriptions.push(groupFilesByPrefix);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map