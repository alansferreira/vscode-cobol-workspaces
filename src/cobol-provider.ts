import { ExtensionContext, languages, DocumentFilter, HoverProvider, TextDocument, Position, CancellationToken, Hover, ReferenceProvider, ReferenceContext, ProviderResult, Location, workspace,  WorkspaceSymbolProvider, SymbolInformation, DocumentSymbolProvider, SymbolKind, Range, DefinitionProvider, Definition, Uri, DocumentSymbol } from "vscode";
import * as Parsers from 'cobol-parsers';

const COBOL_MODE: DocumentFilter = { language: 'COBOL', scheme: 'file' };

const cobolParser = Parsers.program;


export class COBOLHoverProvider implements HoverProvider {
    public provideHover(document: TextDocument, position: Position, token: CancellationToken): Thenable<Hover> {
        return new Promise((resolve, reject) => {
            // const range = document.getWordRangeAtPosition(position, /([a-zA-Z0-9\.]+)(\(([^\)]+)\))?/);
            // if(!range) {
            //     return resolve(new Hover('não encontrado'));
            // }
            
            // resolve(new Hover(document.getText(range)));
            resolve();
        });
    }
}

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

// activated by '#' on search menu
export class COBOLWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    provideWorkspaceSymbols(query: string, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
        
    }
}
export class COBOLDocumentSymbolProvider implements DocumentSymbolProvider {
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[] | DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            
            const parsedJob = cobolParser.parseProgram(document.getText());
            const result: DocumentSymbol[] = [];


            // result.push(new DocumentSymbol('SymbolKind.File', '', SymbolKind.File, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Property', '', SymbolKind.Property, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Module', '', SymbolKind.Module, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Namespace', '', SymbolKind.Namespace, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Package', '', SymbolKind.Package, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Object', '', SymbolKind.Object, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Class', '', SymbolKind.Class, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Method', '', SymbolKind.Method, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Constructor', '', SymbolKind.Constructor, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Function', '', SymbolKind.Function, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Field', '', SymbolKind.Field, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Enum', '', SymbolKind.Enum, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Interface', '', SymbolKind.Interface, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Variable', '', SymbolKind.Variable, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Constant', '', SymbolKind.Constant, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.String', '', SymbolKind.String, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Number', '', SymbolKind.Number, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Boolean', '', SymbolKind.Boolean, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Array', '', SymbolKind.Array, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Key', '', SymbolKind.Key, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Null', '', SymbolKind.Null, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.EnumMember', '', SymbolKind.EnumMember, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Struct', '', SymbolKind.Struct, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Event', '', SymbolKind.Event, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.Operator', '', SymbolKind.Operator, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));
            // result.push(new DocumentSymbol('SymbolKind.TypeParameter', '', SymbolKind.TypeParameter, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0))));




            // parsedJob.statements.map((stmt) => {
            //     try {
            //         const range = new Range(stmt.startedAtLine - 1, 0, stmt.endedAtLine - 1, 0);
            //         let name = `${stmt.labelName}: ${stmt.STMT_TYPE}`;
                    
            //         const startAt = new Range(new Position(stmt.startedAtLine - 1, 0), new Position(stmt.endedAtLine - 1, 0));
            //         const endAt = new Range(new Position(stmt.startedAtLine - 1, 0), new Position(stmt.endedAtLine - 1, 0));

            //         result.push(new DocumentSymbol(name, '', SymbolKind.Key, startAt, endAt));
                    
            //     } catch (error) {
            //         console.log(error);
            //     }
                
            // });

            // const references = cobolParser.extractReferences(parsedJob);
            // const refGroup = new DocumentSymbol('References', 'References', SymbolKind.Namespace, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0)));
            // result.push(refGroup);
            
            
            
            // const kindMap = {
            //     'dd': {
            //         description: 'DD File call',
            //         kind: SymbolKind.File
            //     },
            //     'job': {
            //         description: 'JOB Call',
            //         kind: SymbolKind.Operator
            //     },
            //     'program': {
            //         description: 'PROGRAM Call',
            //         kind: SymbolKind.Interface
            //     },
            // };
            // const addedRefNames: string[] = [];
            // const genericArrayMapper = (spec: Parsers.JobReferenceItem) => {
            //     const name = spec.reference.datasetName || 
            //                 spec.reference.jobName || 
            //                 spec.reference.program || 
            //                 spec.reference.programerName;
            //     if(!name || addedRefNames.indexOf(name) > -1){
            //         return true;
            //     }
            //     addedRefNames.push(name);

            //     refGroup.children.push(new DocumentSymbol(name, kindMap[spec.type].description, kindMap[spec.type].kind, new Range(new Position(spec.startedAtLine - 1, 0), new Position(spec.startedAtLine - 1, 0)), new Range(new Position(spec.startedAtLine - 1, 0), new Position(spec.startedAtLine - 1, 0))));
            //     return true;
            // };

            // if(references.dd){
            //     references.dd.map(genericArrayMapper);
            // }
            // if(references.job){
            //     references.job.map(genericArrayMapper);
            // }
            // if(references.program){
            //     references.program.map(genericArrayMapper);
            // }


            resolve(result);

        });
        
    }
    
}
const regexes = [
    {
        name: 'perform-type-1',
        provideDefinition: (document: TextDocument, position: Position, token: CancellationToken): Definition | undefined => {
            const positionFilter = /PERFORM[ ]{1,}([a-zA-Z0-9#\-]+)/;
            positionFilter.lastIndex = -1;
            const range = document.getWordRangeAtPosition(position, positionFilter);
            if(!range) {
                return undefined;
            }
            const symbol = document.getText(range);
            positionFilter.lastIndex = -1;
            let matchArr = positionFilter.exec(symbol);
            if(!matchArr){
                return undefined;
            }

            matchArr = new RegExp(`[ ]{7,}(${matchArr[1]})`,'gi').exec(document.getText());
            if(!matchArr){
                return undefined;
            }

            return new Location(document.uri, document.positionAt(matchArr.index));
        }    
    }
];

export class COBOLDefinitionProvider implements DefinitionProvider {
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition> {
        return new Promise(async(resolve, reject) => {
            for (let r = 0; r < regexes.length; r++) {
                const defResolver = regexes[r];

                const result = defResolver.provideDefinition(document, position, token);

                if(!result) {
                    continue;
                }
                return resolve(result);
            }

            reject();
        });
    }
}
export class COBOLProvider{
    public static activate(cxt: ExtensionContext){
        
        cxt.subscriptions.push(languages.registerHoverProvider(COBOL_MODE, new COBOLHoverProvider()));
        cxt.subscriptions.push(languages.registerReferenceProvider(COBOL_MODE, new COBOLReferenceProvider()));
        cxt.subscriptions.push(languages.registerDocumentSymbolProvider(COBOL_MODE, new COBOLDocumentSymbolProvider()));
        cxt.subscriptions.push(languages.registerWorkspaceSymbolProvider(new COBOLWorkspaceSymbolProvider()));
        cxt.subscriptions.push(languages.registerDefinitionProvider(COBOL_MODE, new COBOLDefinitionProvider()));
    
    }
}