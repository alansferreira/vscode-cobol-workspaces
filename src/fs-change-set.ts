import * as fs from 'fs';
import * as nedb from 'nedb';
import * as path from 'path';
import { OutputChannel } from './outputChannel';

export class FsChangeSetApplier{
    
    private static mkdir = (fullpath: string) => {
        if(fs.existsSync(fullpath)){
            return true;
        }

        fullpath.split(path.sep).reduce((currentPath, folder) => {
            currentPath += folder + path.sep;
            if (!fs.existsSync(currentPath)){
                fs.mkdirSync(currentPath);
            }
            return currentPath;

        }, '');
        return true;

    }

    private static applyNewDir = (fsChange: IFsChange) => {
        FsChangeSetApplier.mkdir(fsChange.dst);
        return (fs.existsSync(fsChange.dst));
    }

    private static applyRenameDir = (fsChange: IFsChange) => {
        fs.renameSync(fsChange.src, fsChange.dst);
    }

    private static applyRenameFile = (fsChange: IFsChange) => {
        fs.renameSync(fsChange.src, fsChange.dst);
    }
    
    private static applyDelegators = {
        'NEW_DIR': FsChangeSetApplier.applyNewDir,
        'RENAME_DIR': FsChangeSetApplier.applyRenameDir,
        'RENAME_FILE': FsChangeSetApplier.applyRenameFile
    };

    private static undoNewDir = (fsChange: IFsChange) => {
        fs.rmdirSync(fsChange.dst);        
        return (!fs.existsSync(fsChange.dst));
    }

    private static undoRenameDir = (fsChange: IFsChange) => {
        fs.renameSync(fsChange.dst, fsChange.src);
    }

    private static undoRenameFile = (fsChange: IFsChange) => {
        fs.renameSync(fsChange.dst, fsChange.src);
    }

    private static undoDelegators = {
        'NEW_DIR': FsChangeSetApplier.undoNewDir,
        'RENAME_DIR': FsChangeSetApplier.undoRenameDir,
        'RENAME_FILE': FsChangeSetApplier.undoRenameFile
    };


    changeLog: nedb;

    constructor(
        public changeSet: IFsChangeSet
        // public baseDir: string,
        // public changes: IFsChange[],
        // public changedAt: Date
    )
    {
        const storageDir = path.join(this.changeSet.baseDir, '.acitons');
        let storageFilename = path.join(storageDir, `wrk-changes.nedb`);
        
        if(!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir);
        } 
        
        this.changeLog = new nedb({autoload: true, filename: storageFilename});

    }

    buildChanges(): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            return reject(new Error('Not Implemented'));
        });
    }
    buildFolders(parsedFiles: path.ParsedPath[]): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            return reject(new Error('Not Implemented'));
        });
    }
    buildFilesMoves(parsedFiles: path.ParsedPath[]): Promise<IFsChange[]> {
        return new Promise((resolve, reject) => {
            return reject(new Error('Not Implemented'));
        });
    }

    undo(): Promise<any>{
        const _this = this;

        return new Promise((resolve, reject) => {
            const changesCopy: IFsChange[] = [];

            this.changeLog
            .find({})
            .sort({changedAt: -1})
            .limit(1)
            .exec((err: any, docs: any[]) => {
                const changeSets = <IFsChangeSet[]>docs;  
                if(!changeSets || !changeSets.length) {
                    return resolve({ok: true});
                }

                changeSets.map((changeSet: IFsChangeSet) => {
                    changesCopy.push(...changeSet.changes.sort((a, b) => b.index - a.index));
                    
                    const intervalKey = setInterval(() => {
                        if(changesCopy.length === 0 ) {
                            clearInterval(intervalKey);
        
                            _this.changeLog.remove({_id: changeSet._id},(err: any, doc: any) => {
                                
                                resolve({ok: true});
                            
                            });
        
                            return;
                        }
        
                        const change: IFsChange = changesCopy.splice(0,1)[0];
                        
                        OutputChannel.appendLine(`unding: ${change.type}, ${change.dst} => ${change.src}`);
                        try {
                            this.undoChange(change);
                            OutputChannel.appendLine(`unded : ${change.type}, ${change.dst} => ${change.src}`);
                        } catch (error) {
                            console.error(error);
                            OutputChannel.appendLine(`error  : ${error}, ${change.dst} => ${change.src}`);
                        }
                
                    }, 10);
                            
                    // changeSet.changes
                    // .sort((a, b) => b.index - a.index)
                    // .map((change) => {
                    //     OutputChannel.appendLine(`${change.index}: "${change.src}" => "${change.dst}";`);
                    //     // FsChangeSetApplier.undoDelegators[change.type](change);
                    // });
                });
            });
        });
        
    }
    
    undoChange(change: IFsChange){
        FsChangeSetApplier.undoDelegators[change.type](change);
    }

    applyChange(change: IFsChange){
        FsChangeSetApplier.applyDelegators[change.type](change);
    }
    apply(){
        const _this = this;
        return new Promise((resolve, reject) =>{

            var changesCopy: IFsChange[] = [];
            changesCopy.push(...this.changeSet.changes);

            const intervalKey = setInterval(() => {
                if(changesCopy.length === 0 ) {
                    clearInterval(intervalKey);

                    _this.changeLog.insert({
                        changes: _this.changeSet.changes,
                        changedAt: _this.changeSet.changedAt,
                        baseDir: _this.changeSet.baseDir
                    },(err: any, doc: any) => {
                        
                        resolve({ok: true});
                    
                    });

                    return;
                }

                const change: IFsChange = changesCopy.splice(0,1)[0];
                
                OutputChannel.appendLine(`appling: ${change.type}, ${change.src} => ${change.dst}`);
                try {
                    this.applyChange(change);
                    OutputChannel.appendLine(`applied : ${change.type}, ${change.src} => ${change.dst}`);
                } catch (error) {
                    console.error(error);
                    OutputChannel.appendLine(`error  : ${error}, ${change.src} => ${change.dst}`);
                }

            }, 10);

        });
    }

}

export enum FsChangeType{
    NEW_DIR = 'NEW_DIR',
    RENAME_DIR = 'RENAME_DIR',
    RENAME_FILE = 'RENAME_FILE'
}

export interface IFsChangeApplyFunction { (): boolean; }
export interface IFsChangeUndoFunction { (): boolean; }

export interface IFsChangeSet{
    _id?: any;
    type: string;
    baseDir: string;
    changes: IFsChange[];
    changedAt: Date;
}

export interface IFsChange{
    type: FsChangeType;
    index: number;
    src: string;
    dst: string;
    apply: IFsChangeApplyFunction;
    undo: IFsChangeUndoFunction;
}

