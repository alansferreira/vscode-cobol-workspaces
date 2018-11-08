import { ExtensionContext, languages, DocumentFilter, HoverProvider, TextDocument, Position, CancellationToken, Hover, ReferenceProvider, ReferenceContext, ProviderResult, Location, workspace,  WorkspaceSymbolProvider, SymbolInformation, DocumentSymbolProvider, SymbolKind, Range, DefinitionProvider, Definition, Uri, DocumentSymbol } from "vscode";
import * as Parsers from 'cobol-parsers';


export class COBOLReferenceProvider implements ReferenceProvider {
    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        return new Promise((resolve, reject) => {
            try {
                const locations: Location[] = [];

                
                // const range = document.getWordRangeAtPosition(position, /([a-zA-Z0-9\.]+)(\(([^\)]+)\))?/);
                // if(!range) {
                //     return resolve(locations);
                // }
                
                // const currentSelection = document.getText(range);

                // const parsedJob = cobolParser.parseJob(document.getText());
                // cobolParser.extractReferences(parsedJob);

                
                // locations.push(new Location(Uri.file(), position)); 
                resolve(locations);
                
            } catch (error) {
                reject(error);
            }
        });  
    }   
}
