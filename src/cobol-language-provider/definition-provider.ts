import { CancellationToken, Definition, DefinitionProvider, Location, Position, ProviderResult, TextDocument, workspace, window, Range } from "vscode";
import * as fs from 'fs';

import * as Parsers from 'cobol-parsers';

const cobolParser = Parsers.program;



abstract class DocumentDefinitionFilter {
    positionFilterMatch: RegExpExecArray | null = null;

    abstract getPositionFilter(): RegExp ;
    abstract getDefinitionFilter(): RegExp | null ;
    
    getLocation(document: TextDocument, token: CancellationToken): Promise<Location>{
        return new Promise((resolve, reject) => {
            if(!this.positionFilterMatch){
                return reject();
            }
            const defFilter = this.getDefinitionFilter();
            if(!defFilter){
                return reject();
            }
            const matchArr = defFilter.exec(document.getText());
            if(!matchArr){
                return reject();
            }
            return resolve(new Location(document.uri, document.positionAt(matchArr.index)));
        });

    }
    
    hasMatchLocation(document: TextDocument, position: Position, token: CancellationToken): boolean {
        const range = document.getWordRangeAtPosition(position, this.getPositionFilter());
        if(!range) {
            return false;
        }
        
        const selectionFilter = document.getText(range);
        const matchArr = this.getPositionFilter().exec(selectionFilter);
        if(!matchArr){
            return false;
        }
        
        this.positionFilterMatch = matchArr;
                
        return true;
    }

}

class PerformDocumentFilter extends DocumentDefinitionFilter{
    getPositionFilter(): RegExp { return /PERFORM[ ]{1,}([a-zA-Z0-9#\-]+)/; }
    getDefinitionFilter(): RegExp | null { 
        if(!this.positionFilterMatch || this.positionFilterMatch.length < 2) { return null; }
        return new RegExp(`[ ]{7,}(${this.positionFilterMatch[1]})`,'gi'); 
    }
}

class CopyDefinitionDocumentFilter extends DocumentDefinitionFilter{
    getPositionFilter(): RegExp { return /COPY[ ]{1,}([a-zA-Z0-9#\-]+)/; }
    getDefinitionFilter(): RegExp | null { 
        if(!this.positionFilterMatch || this.positionFilterMatch.length < 2) { return null; }
        return new RegExp(`[ ]{7,}(${this.positionFilterMatch[1]})`,'gi'); 
    }
    
    getLocation(document: TextDocument, token: CancellationToken): Promise<Location>{
        return new Promise(async (resolve, reject) => {
            if(!this.positionFilterMatch) { return resolve(); }

            const globInclude = this.positionFilterMatch[1].replace(/(.)/gi, (sub: string, args:[]): string => {
                return `[${sub.toUpperCase()}${sub.toLowerCase()}]`;
            });
            const files = await workspace.findFiles(`**/${globInclude}*`);

            if(!files || files.length === 0) {
                return resolve();
            }

            const file = files[0];
            resolve(new Location(file, new Range(0,0,0,0)));

        });
    }
}



abstract class VariableDocumentFilter extends DocumentDefinitionFilter{
    getDefinitionFilter(): RegExp | null { 
        if(!this.positionFilterMatch || this.positionFilterMatch.length < 2) { return null; }
        return new RegExp(`^[ ]{6,}([ ]{1,})[0-9]+[ ]{1,}(${this.positionFilterMatch[1]})[ \.]`,'gmi'); 
    }

    getLocation(document: TextDocument, token: CancellationToken): Promise<Location>{
        return new Promise(async (resolve, reject) => {
            try {
                
                if(!this.positionFilterMatch){
                    return resolve();
                }
                const defFilter = this.getDefinitionFilter();
                if(!defFilter){
                    return resolve();
                }
                
                let matchArr = defFilter.exec(document.getText());
                if(matchArr) { return resolve(new Location(document.uri, document.positionAt(matchArr.index))); }
    
                const parsedRefs = cobolParser.extractReferences(cobolParser.parseProgram(document.getText()));
                if(!parsedRefs.copybook) { return resolve(); }
    
                const fileRefs = parsedRefs.copybook.map((cpy) => `**/${cpy.reference.fileName}*`);
    
                for (let fRef = 0; fRef < fileRefs.length; fRef++) {
                    if(token.isCancellationRequested) { 
                        return resolve(); 
                    }
    
                    const fileRef = fileRefs[fRef];
                    const files = await workspace.findFiles(fileRef, undefined, 100, token);
        
                    for (let f = 0; f < files.length; f++) {
                        const file = files[f];
                        const stat = fs.statSync(file.fsPath);
                        
                        if(stat.size > 1000000){ continue; }
        
                        const content = fs.readFileSync(file.fsPath);
                        matchArr = defFilter.exec(content.toString());
                        if(!matchArr) { continue; }
                        
                        const srcDocument = await workspace.openTextDocument(file.fsPath);
                        return resolve(new Location(srcDocument.uri, srcDocument.positionAt(matchArr.index)));
        
                        
                    }
    
                    
                }
            } catch (error) {
                window.showErrorMessage(error);
            }
            
            return resolve();

        });

    }


}

class MoveDocumentFilter extends VariableDocumentFilter{
    getPositionFilter(): RegExp { return /MOVE[ ]{1,}([a-zA-Z0-9#\-]+)/; }
}
class MoveToDocumentFilter extends VariableDocumentFilter{
    getPositionFilter(): RegExp { return / TO[ ]{1,}([a-zA-Z0-9#\-]+)/; }
}

const definitionResolver: DocumentDefinitionFilter[] = [
    new PerformDocumentFilter(),
    new MoveDocumentFilter(),
    new MoveToDocumentFilter(),
    new CopyDefinitionDocumentFilter()
];





export class COBOLDefinitionProvider implements DefinitionProvider {
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition> {
        return new Promise(async(resolve, reject) => {
            for (let r = 0; r < definitionResolver.length; r++) {
                const defResolver = definitionResolver[r];

                if(defResolver.hasMatchLocation(document, position, token)){
                    return resolve(await defResolver.getLocation(document, token));
                }

            }

            reject();
        });
    }
}
