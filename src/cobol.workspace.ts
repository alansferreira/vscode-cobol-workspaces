import * as nedb from 'nedb';
import * as path from 'path';
import { window, workspace, WorkspaceFolder, Uri } from 'vscode';
import { OutputChannel } from './outputChannel';
import { FsChangeSet, FsChangeType, FsChange } from './fs-change-set';

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


let wrkDb: any = {};

export class CobolWorkspace{

    constructor(){}

    initOperationsDb(){
        if(!workspace || !workspace.workspaceFolders){
            wrkDb = {};
            return;
        }

        workspace
        .workspaceFolders
        .map((wrk)=>{
            wrkDb[wrk.uri.fsPath] = new nedb({autoload: true, filename: path.join(wrk.uri.fsPath, '.vscode', 'file-operations.db')});
        });
    }

    excludedExtenssions = ['7z','bak','cproject','cs','css','ctrl','dat','data','db','dll','doc','docx','event','exe','flag','gif','hce','htm','html','index','ini','jpeg','jpg','js','launch','lck','lnk','lock','log','luc','mark','markers','mht','msg','pdf','pdom','png','ppt','prefs','project','properties','ps','rar','resources','scc','sig','src','trace','tree','ts','url','version','vsd','wav','xls','xlsx','xml','xsl','ydy','ydyd','zip', 'mp3'];
    moveFolderInclusions = ['cbl','cob', 'job','jcl','dclg','dclgen','dclg.cpy','dclgen.cpy','fd','cpy','sql','bms'];

    
    groupFilesByPrefix(){
        if(!workspace.workspaceFolders) {
            return;
        }
        
        workspace.workspaceFolders.map((wrk) => {
            window.showInformationMessage('Grouping files prefix ...');

            const executor = new GroupByPrefix(wrk, 'src');
            
            executor.buildChanges()
            .then((fsChanges) => {
                executor.changes = fsChanges;
                executor.apply();
            });
        
        });

    }

 
}

export class GroupByPrefix extends FsChangeSet{
    basePath: string;

    constructor(
        private workspaceFolder: WorkspaceFolder,
        private middlePath?: string,
    )
    {
        super(workspaceFolder.uri.fsPath, [], new Date());
        this.basePath = path.join(this.workspaceFolder.uri.fsPath, path.sep).toLowerCase();
    }


    buildChanges(): Promise<FsChange[]> {
        return new Promise((resolve, reject) => {
            
            workspace
            .findFiles('**/*', '.actions')
            .then((files: Uri[]) => {
                const filteredFiles = files.filter((f) => {
                    
                    if(!f.fsPath.startsWith(this.basePath)){
                        return false;
                    }

                    const parsed = path.parse(f.fsPath);
                    if(parsed.name.length < 5){
                        OutputChannel.appendLine(`skkiped: '${f.fsPath}', name size lessthan 5.`);
                        return false;
                    }
                    return true;
                }).map((f) => path.parse(f.fsPath));

                
                const fsChanges: FsChange[] = [];
                this.buildFolders(filteredFiles)
                .then((fsChangesDir) => {

                    fsChanges.push(...fsChangesDir);

                    this.buildFilesMoves(filteredFiles).then((fsChangesFiles) => {
                        fsChanges.push(...fsChangesFiles);

                        return resolve(fsChanges);

                    });
                });

            });
            
        });
    }
    buildFolders(parsedFiles: path.ParsedPath[]): Promise<FsChange[]> {
        return new Promise((resolve, reject) => {
            const fsChanges:  FsChange[] = [];
            const paths: string[] = [];
            
            if(this.middlePath){
                const dst = path.join(this.workspaceFolder.uri.fsPath, this.middlePath);
    
                fsChanges.push(<FsChange>{src: '', dst: dst, type: FsChangeType.NEW_DIR});
            }
    
    
            parsedFiles.map((f) => {
                const dst = path.join(this.workspaceFolder.uri.fsPath, this.middlePath || '', f.name.substring(0, 4));
                
                if (paths.indexOf(dst) >- 1 ){
                    return;
                }
                paths.push(dst);
                fsChanges.push(<FsChange>{src: '', dst: dst, type: FsChangeType.NEW_DIR});
    
            });
    
            return resolve(fsChanges);
        });
    }
    buildFilesMoves(parsedFiles: path.ParsedPath[]): Promise<FsChange[]> {
        return new Promise((resolve, reject) => {
            const fsChanges: FsChange[] = [];

            parsedFiles.map((parsedFile) => {
                const absRootDir = path.join(this.workspaceFolder.uri.fsPath, this.middlePath || '');
                const dstDir = path.join(absRootDir, parsedFile.name.substr(0, 4), path.sep);
                const srcFullPath = path.join(parsedFile.dir,parsedFile.base);
                const dstFullPath = path.join(dstDir, parsedFile.base);
    
                if(srcFullPath.startsWith(dstDir)){
                    OutputChannel.appendLine(`skkiped: '${srcFullPath}', aleady is in folder.`);
                    return fsChanges;
                } 
        
                fsChanges.push(<FsChange>{src: srcFullPath, dst: dstFullPath, type: FsChangeType.RENAME_FILE});
        
                OutputChannel.appendLine(`moving from: '${srcFullPath}'`);
                OutputChannel.appendLine(`         to: '${dstFullPath}'`);
        
            });
            
            return resolve(fsChanges);
        });
    }

}