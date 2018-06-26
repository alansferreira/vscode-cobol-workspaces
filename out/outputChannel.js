"use strict";
"user strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const outputChannel = vscode_1.window.createOutputChannel("COBOL");
class OutputChannel {
    static appendLineError(value) {
        outputChannel.show(true);
        outputChannel.appendLine(value);
    }
    static appendLine(value) {
        outputChannel.show(true);
        outputChannel.appendLine(value);
    }
}
exports.OutputChannel = OutputChannel;
//# sourceMappingURL=outputChannel.js.map