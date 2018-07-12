import * as fs from 'fs';
import * as path from 'path';
import { window, workspace, WorkspaceFolder, Uri } from 'vscode';
import { OutputChannel } from './outputChannel';
import { FsChangeSetApplier, FsChangeType, IFsChange, IFsChangeSet } from './fs-change-set';

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
        extenssion: 'dclgen',
        regx: /CREATE[ ]{1,}TABLE[ ]{1}.*^[ ]{7,}[0-9]+[ ].*\./igm,
    },
    {
        type: 'dclgenSource1',
        extenssion: 'dclgen',
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


const excludedExtenssions = ['7z','bak','cproject','cs','css','ctrl','dat','data','db','dll','doc','docx','event','exe','flag','gif','hce','htm','html','index','ini','jpeg','jpg','js','launch','lck','lnk','lock','log','luc','mark','markers','mht','msg','pdf','pdom','png','ppt','prefs','project','properties','ps','rar','resources','scc','sig','src','trace','tree','ts','url','version','vsd','wav','xls','xlsx','xml','xsl','ydy','ydyd','zip', 'mp3'];
const moveFolderInclusions = ['cbl','cob', 'job','jcl','dclg','dclgen','dclg.cpy','dclgen.cpy','fd','cpy','sql','bms'];

export class CobolWorkspace{

    constructor(){}
    
    fixFilesExtensions(){
        if(!workspace.workspaceFolders) {
            return;
        }
        
        workspace.workspaceFolders.map((wrk) => {
            window.showInformationMessage('Fixing files extensions ...');

            const executor = new FixFilesExtenssions(wrk);
            
            executor.buildChanges()
            .then((fsChanges) => {
                executor.changeSet.changes = fsChanges;
                executor.apply()
                .then(() => {
                    window.showInformationMessage('Files extensions fixed!');
                });
            });
        
        });

    }

    groupFilesByPrefix(){
        if(!workspace.workspaceFolders) {
            return;
        }
        
        workspace.workspaceFolders.map((wrk) => {
            window.showInformationMessage('Grouping files prefix ...');

            const executor = new GroupByPrefix(wrk, 'src');
            
            executor.buildChanges()
            .then((fsChanges) => {
                executor.changeSet.changes = fsChanges;
                executor.apply()
                .then(() => {
                    window.showInformationMessage('Grouping files finished!');
                });
            });
        
        });

    }

    undoLastAction(){
        if(!workspace.workspaceFolders) {
            return;
        }


        workspace.workspaceFolders.map((wrk) => {
            window.showInformationMessage('Undoing last workspace changes ...');

            const executor = new FsChangeSetApplier({
                type: 'GENERICUNDO',
                baseDir: wrk.uri.fsPath, 
                changes: [], 
                changedAt: new Date()
            });
            
            executor.undo()
            .then(() => {
                window.showInformationMessage('Last workspace changes undoed!');
            });
        });

    }
 
}

export class GroupByPrefix extends FsChangeSetApplier{
    basePath: string;

    constructor(
        private workspaceFolder: WorkspaceFolder,
        private middlePath?: string,
    )
    {
        super(<IFsChangeSet>{
            type: 'GROUPBYPREFIX',
            baseDir: workspaceFolder.uri.fsPath, 
            changes: [], 
            changedAt: new Date()
        });
        this.basePath = path.join(this.workspaceFolder.uri.fsPath, path.sep).toLowerCase();
    }


    buildChanges(): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            
            workspace
            .findFiles('**/*', '.actions')
            .then((files: Uri[]) => {
                const filteredFiles = files.filter((f) => {
                    
                    if(!f.fsPath.startsWith(this.basePath)){
                        return false;
                    }

                    const parsed = path.parse(f.fsPath);
                    if(moveFolderInclusions.indexOf(parsed.ext.toLowerCase().substring(1)) === -1){
                        return false;
                    }
                    
                    if(parsed.name.length < 5){
                        OutputChannel.appendLine(`skkiped: '${f.fsPath}', name size lessthan 5.`);
                        return false;
                    }
                    return true;
                }).map((f) => path.parse(f.fsPath));

                
                const fsChanges: IFsChange[] = [];
                this.buildFolders(filteredFiles)
                .then((fsChangesDir) => {

                    fsChanges.push(...fsChangesDir);

                    this.buildFilesMoves(filteredFiles).then((fsChangesFiles) => {
                        fsChanges.push(...fsChangesFiles);

                        for (let i = 0; i < fsChanges.length; i++) {
                            fsChanges[i].index = i;
                        }

                        return resolve(fsChanges);

                    });
                });

            });
            
        });
    }
    buildFolders(parsedFiles: path.ParsedPath[]): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            const fsChanges:  IFsChange[] = [];
            const paths: string[] = [];
            
            if(this.middlePath){
                const dst = path.join(this.workspaceFolder.uri.fsPath, this.middlePath);
    
                fsChanges.push(<IFsChange>{src: '', dst: dst, type: FsChangeType.NEW_DIR});
            }
    
    
            parsedFiles.map((f) => {
                const dst = path.join(this.workspaceFolder.uri.fsPath, this.middlePath || '', f.name.substring(0, 4));
                
                if (paths.indexOf(dst) >- 1 ){
                    return;
                }
                paths.push(dst);
                fsChanges.push(<IFsChange>{src: '', dst: dst, type: FsChangeType.NEW_DIR});
    
            });
    
            return resolve(fsChanges);
        });
    }
    buildFilesMoves(parsedFiles: path.ParsedPath[]): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            const fsChanges: IFsChange[] = [];

            parsedFiles.map((parsedFile) => {
                const absRootDir = path.join(this.workspaceFolder.uri.fsPath, this.middlePath || '');
                const dstDir = path.join(absRootDir, parsedFile.name.substr(0, 4), path.sep);
                const srcFullPath = path.join(parsedFile.dir,parsedFile.base);
                const dstFullPath = path.join(dstDir, parsedFile.base);
    
                if(srcFullPath.startsWith(dstDir)){
                    OutputChannel.appendLine(`skkiped: '${srcFullPath}', aleady is in folder.`);
                    return fsChanges;
                } 
        
                fsChanges.push(<IFsChange>{src: srcFullPath, dst: dstFullPath, type: FsChangeType.RENAME_FILE});
        
                OutputChannel.appendLine(`moving from: '${srcFullPath}'`);
                OutputChannel.appendLine(`         to: '${dstFullPath}'`);
        
            });
            
            return resolve(fsChanges);
        });
    }

}

export class FixFilesExtenssions extends FsChangeSetApplier{
    constructor(
        workspaceFolder: WorkspaceFolder
    )
    {
        super(<IFsChangeSet>{
            type: 'FIXEXTENSIONS',
            baseDir: workspaceFolder.uri.fsPath, 
            changes: [], 
            changedAt: new Date()
        });
    }


    buildChanges(): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            
            workspace
            .findFiles('**/*', '.actions')
            .then((files: Uri[]) => {
                const filteredFiles = files.filter((f) => {
                    
                    const ext = path.extname(f.fsPath).toLowerCase();
            
                    if(ext && excludedExtenssions.indexOf(ext.substr(1)) > -1){
                        return false;
                    }
                    return true;
                }).map((f) => path.parse(f.fsPath));

                const fsChanges: IFsChange[] = [];
                
                this.buildFilesMoves(filteredFiles)
                .then((fsChangesFiles) => {
                    fsChanges.push(...fsChangesFiles);

                    for (let i = 0; i < fsChanges.length; i++) {
                        fsChanges[i].index = i;
                    }

                    return resolve(fsChanges);

                });

            });
            
        });
    }
    buildFilesMoves(parsedFiles: path.ParsedPath[]): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            const fsChanges: IFsChange[] = [];
            const parsedFilesCopy: path.ParsedPath[] = [];
            
            parsedFilesCopy.push(...parsedFiles);

            const intervalKey = setInterval(() => {
                if(parsedFilesCopy.length === 0){
                    clearInterval(intervalKey);
                    resolve(fsChanges);
                }
                
                const srcParsed = parsedFilesCopy.splice(0,1)[0];
                const srcFullPath = path.join(srcParsed.dir, srcParsed.base);
                
                fs.stat(srcFullPath, (err, stat) => {
                    if(stat.size > (1024 * 1024 * 2)){
                        OutputChannel.appendLine(`too large, f: '${srcFullPath}', s: ${stat.size}`);
                        return;
                    }
        
                    const content = fs.readFileSync(srcFullPath).toString();
                    
                    for (let i = 0; i < map.length; i++) {
                        const m = map[i];
                        if(m.regx.test(content) || m.regx.test(content)) {
                            const dstFullPath = path.join(srcParsed.dir, srcParsed.name + '.' + m.extenssion);
                            
                            fsChanges.push(<IFsChange>{src: srcFullPath, dst: dstFullPath, type: FsChangeType.RENAME_FILE});

                            return;
                        }                        
                    }
                    return;
                });
            }, 10);
        });
    }

}