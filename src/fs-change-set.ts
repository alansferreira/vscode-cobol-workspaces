import * as fs from 'fs';
import * as moment from 'moment';
import * as nedb from 'nedb';
import * as path from 'path';

export class FsChangeSet{
    
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

    }

    private static applyNewDir = (fsChange: FsChange) => {
        if(fs.existsSync(fsChange.dst)){
            return true;
        }

        FsChangeSet.mkdir(fsChange.dst);

        return (fs.existsSync(fsChange.dst));
    }

    private static applyRenameDir = (fsChange: FsChange) => {
        fs.renameSync(fsChange.src, fsChange.dst);
    }

    private static applyRenameFile = (fsChange: FsChange) => {
        fs.renameSync(fsChange.src, fsChange.dst);
    }
    
    private static applyDelegators = {
        'NEW_DIR': FsChangeSet.applyNewDir,
        'RENAME_DIR': FsChangeSet.applyRenameDir,
        'RENAME_FILE': FsChangeSet.applyRenameFile
    };


    constructor(
        public baseDir: string,
        public changes: FsChange[],
        public changedAt: Date)
    {


    }

    buildChanges(): Promise<FsChange[]> {
        return new Promise((resolve, reject) => {
            return reject(new Error('Not Implemented'));
        });
    }
    buildFolders(parsedFiles: path.ParsedPath[]): Promise<FsChange[]> {
        return new Promise((resolve, reject) => {
            return reject(new Error('Not Implemented'));
        });
    }
    buildFilesMoves(parsedFiles: path.ParsedPath[]): Promise<FsChange[]> {
        return new Promise((resolve, reject) => {
            return reject(new Error('Not Implemented'));
        });
    }

    apply(){
        const _this = this;
        const storageDir = path.join(this.baseDir, '.acitons');
        let storageFilename = path.join(storageDir, `wrk-changes.json`);
        
        if(!fs.existsSync(storageDir)) {
            fs.mkdirSync(storageDir);
        } 
        
        const changeLog = new nedb({autoload: true, filename: storageFilename});

        var changesCopy: FsChange[] = [];
        changesCopy.push(...this.changes);

        const intervalKey = setInterval(() => {
            if(changesCopy.length === 0 ) {
                clearInterval(intervalKey);

                changeLog.insert({
                    changes: _this.changes,
                    changedAt: _this.changedAt,
                    baseDir: _this.baseDir
                });

                return;
            }

            const change: FsChange = changesCopy.splice(0,1)[0];
            
            FsChangeSet.applyDelegators[change.type](change);

        }, 10);

    }

}

export enum FsChangeType{
    NEW_DIR = 'NEW_DIR',
    RENAME_DIR = 'RENAME_DIR',
    RENAME_FILE = 'RENAME_FILE'
}

export interface FsChangeApplyFunction { (): boolean; }
export interface FsChangeUndoFunction { (): boolean; }

export interface FsChange{
    type: FsChangeType;
    src: string;
    dst: string;
    apply: FsChangeApplyFunction;
    undo: FsChangeUndoFunction;
}

