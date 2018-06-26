"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs = require("fs");
const path = require("path");
const outputChannel_1 = require("./outputChannel");
const map = [
    {
        type: 'cobolSource',
        extenssion: 'cob',
        regx: /^.{6} ((IDENTIFICATION)|(ID))[ ]{1,}DIVISION[ ]{0,}\./igm,
    },
    {
        type: 'jclSource',
        extenssion: 'jcl',
        regx: /^\/\/.........JOB/igm,
    },
    {
        type: 'dclgenSource',
        extenssion: 'dclgen.cpy',
        regx: /CREATE[ ]{1,}TABLE[ ]{1}.*^[ ]{7,}[0-9]+[ ].*\./igm,
    },
    {
        type: 'dclgenSource1',
        extenssion: 'dclgen.cpy',
        regx: /EXEC[ ]{1,}SQL[ ]{1,}DECLARE[ ]{1,}.*[ ]{1}TABLE/igm,
    },
    {
        type: 'fdSource',
        extenssion: 'fd',
        regx: /^.{8,}FD[ ]{1,}([a-zA-Z0-9#]+)[ ]{0,}\./igm,
    },
    {
        type: 'copyBookSource',
        extenssion: 'cpy',
        regx: /^.{6,} +[0-9]+[ ].*\./igm,
    },
    {
        type: 'tableSource',
        extenssion: 'sql',
        regx: /CREATE[ ]{1,}TABLE[ ]{1}.*/ig,
    },
    {
        type: 'bmsSource',
        extenssion: 'bms',
        regx: /^(........[ ]{1,}(DFHMSD|DFHMDX|DFHMDF))/ig,
    },
];
class CobolWorkspace {
    constructor() {
        this.excludedExtenssions = ['7z', 'bak', 'cproject', 'cs', 'css', 'ctrl', 'dat', 'data', 'db', 'dll', 'doc', 'docx', 'event', 'exe', 'flag', 'gif', 'hce', 'htm', 'html', 'index', 'ini', 'jpeg', 'jpg', 'js', 'launch', 'lck', 'lnk', 'lock', 'log', 'luc', 'mark', 'markers', 'mht', 'msg', 'pdf', 'pdom', 'png', 'ppt', 'prefs', 'project', 'properties', 'ps', 'rar', 'resources', 'scc', 'sig', 'src', 'trace', 'tree', 'ts', 'url', 'version', 'vsd', 'wav', 'xls', 'xlsx', 'xml', 'xsl', 'ydy', 'ydyd', 'zip', 'mp3'];
        this.moveFolderInclusions = ['cbl', 'cob', 'job', 'jcl', 'dclg', 'dclgen', 'dclg.cpy', 'dclgen.cpy', 'fd', 'cpy', 'sql', 'bms'];
    }
    fixFilesExtenssions(files) {
        const filteredFiles = files.filter((file) => {
            const ext = path.extname(file.fsPath).toLowerCase();
            if (ext && this.excludedExtenssions.indexOf(ext.substr(1)) > -1) {
                return false;
            }
            return true;
        });
        filteredFiles.map((file, i) => {
            setTimeout(() => {
                if (i >= filteredFiles.length - 1) {
                    vscode_1.window.showInformationMessage('Renaming files extenssions finished!');
                }
                this.fixFileExtenssion(file);
            }, 10 * i);
        });
    }
    groupFilesByPrefix() {
        if (!vscode_1.workspace.workspaceFolders) {
            return;
        }
        vscode_1.workspace.workspaceFolders.map((wrk) => {
            vscode_1.window.showInformationMessage('Grouping files prefix ...');
            vscode_1.workspace
                .findFiles('**/*')
                .then((files) => {
                const filteredFiles = files.filter((file) => {
                    const ext = path.extname(file.fsPath).toLowerCase();
                    if (!ext || this.moveFolderInclusions.indexOf(ext.substr(1)) === -1) {
                        outputChannel_1.OutputChannel.appendLine(`skipped: '${file.fsPath}'`);
                        return false;
                    }
                    return true;
                });
                filteredFiles.map((f, i) => {
                    setTimeout(() => {
                        if (i >= filteredFiles.length - 1) {
                            vscode_1.window.showInformationMessage('Grouping files finished!');
                        }
                        this.groupFileByPrefix(wrk.uri.fsPath, f);
                    }, 10 * i);
                });
            });
        });
    }
    renameExtenssion(src, newExtenssion) {
        const srcParsed = path.parse(src);
        const dst = path.join(srcParsed.dir, srcParsed.name + '.' + newExtenssion);
        const dstParsed = path.parse(dst);
        if (dstParsed.ext.toLowerCase() === srcParsed.ext.toLowerCase()) {
            return;
        }
        outputChannel_1.OutputChannel.appendLine(`renaming  : ${src}`);
        fs.rename(src, dst, (err) => {
            if (err) {
                outputChannel_1.OutputChannel.appendLineError(`error renaming: '${src}'`);
                outputChannel_1.OutputChannel.appendLineError(`            to: '${dst}'`);
                return;
            }
            outputChannel_1.OutputChannel.appendLine(`renamed to: ${dst}`);
        });
    }
    fixFileExtenssion(file) {
        fs.stat(file.fsPath, (err, stat) => {
            if (stat.size > (1024 * 1024 * 2)) {
                outputChannel_1.OutputChannel.appendLine(`too large, f: '${file.path}', s: ${stat.size}`);
                return;
            }
            const content = fs.readFileSync(file.fsPath).toString();
            for (let i = 0; i < map.length; i++) {
                const m = map[i];
                if (m.regx.test(content) || m.regx.test(content)) {
                    this.renameExtenssion(file.fsPath, m.extenssion);
                    return;
                }
            }
            outputChannel_1.OutputChannel.appendLine(`not renamed: '${file.fsPath}'`);
            return;
        });
    }
    fixWorkspaceFilesExtenssions() {
        vscode_1.window.showInformationMessage('Finding and renaming files extenssions...');
        vscode_1.workspace.findFiles('**/*')
            .then((files) => {
            this.fixFilesExtenssions(files);
        });
    }
    mkdir(fullDirName) {
        if (fs.existsSync(fullDirName)) {
            return;
        }
        fullDirName
            .split(path.sep)
            .reduce((currentPath, folder) => {
            currentPath += folder + path.sep;
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
            return currentPath;
        }, '');
    }
    groupFileByPrefix(baseFolder, file) {
        const parsed = path.parse(file.fsPath);
        const absRootDir = path.join(path.resolve(baseFolder), 'src');
        if (parsed.name.length < 8) {
            return;
        }
        if (this.moveFolderInclusions.indexOf(parsed.ext.substring(1).toLowerCase()) === -1) {
            return;
        }
        const dstDir = path.join(absRootDir, parsed.name.substr(0, 4));
        if (file.fsPath.toLowerCase().startsWith(dstDir.toLowerCase())) {
            outputChannel_1.OutputChannel.appendLine(`skkiped: '${file.fsPath}'`);
            return;
        }
        this.mkdir(dstDir);
        outputChannel_1.OutputChannel.appendLine(`moving from: '${file.fsPath}'`);
        outputChannel_1.OutputChannel.appendLine(`         to: '${path.join(dstDir, parsed.base)}'`);
        fs.rename(file.fsPath, path.join(dstDir, parsed.base), (err) => {
            if (err) {
                outputChannel_1.OutputChannel.appendLine(`moved error!`);
                return;
            }
            outputChannel_1.OutputChannel.appendLine(`moved ok!`);
        });
    }
}
exports.CobolWorkspace = CobolWorkspace;
//# sourceMappingURL=cobol.workspace.js.map