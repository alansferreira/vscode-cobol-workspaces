import { ExtensionContext, languages, DocumentFilter, HoverProvider, TextDocument, Position, CancellationToken, Hover, ReferenceProvider, ReferenceContext, ProviderResult, Location, workspace,  WorkspaceSymbolProvider, SymbolInformation, DocumentSymbolProvider, SymbolKind, Range, DefinitionProvider, Definition, Uri, DocumentSymbol } from "vscode";
import * as Parsers from 'cobol-parsers';

const JCL_MODE: DocumentFilter = { language: 'JCL', scheme: 'file' };

const jclParser = Parsers.jcl;


export class JCLHoverProvider implements HoverProvider {
    public provideHover(document: TextDocument, position: Position, token: CancellationToken): Thenable<Hover> {
        return new Promise((resolve, reject) => {
            const range = document.getWordRangeAtPosition(position, /([a-zA-Z0-9\.]+)(\(([^\)]+)\))?/);
            if(!range) {
                return resolve(new Hover('não encontrado'));
            }
            
            resolve(new Hover(document.getText(range)));
        });
    }
}

export class JCLReferenceProvider implements ReferenceProvider {
    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        return new Promise((resolve, reject) => {
            try {
                const locations: Location[] = [];

                
                const range = document.getWordRangeAtPosition(position, /([a-zA-Z0-9\.]+)(\(([^\)]+)\))?/);
                if(!range) {
                    return resolve(locations);
                }
                
                const currentSelection = document.getText(range);

                const parsedJob = jclParser.parseJob(document.getText());
                jclParser.extractReferences(parsedJob);

                
                // locations.push(new Location(Uri.file(), position)); 
                resolve(locations);
                
            } catch (error) {
                reject(error);
            }
        });  
    }   
}

// activated by '#' on search menu
export class JCLWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    provideWorkspaceSymbols(query: string, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            resolve([]);
        });
        
    }
}
export class JCLDocumentSymbolProvider implements DocumentSymbolProvider {
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[] | DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            
            const parsedJob = jclParser.parseJob(document.getText());
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




            parsedJob.statements.map((stmt) => {
                try {
                    const range = new Range(stmt.startedAtLine - 1, 0, stmt.endedAtLine - 1, 0);
                    let name = `${stmt.labelName}: ${stmt.STMT_TYPE}`;
                    
                    const startAt = new Range(new Position(stmt.startedAtLine - 1, 0), new Position(stmt.endedAtLine - 1, 0));
                    const endAt = new Range(new Position(stmt.startedAtLine - 1, 0), new Position(stmt.endedAtLine - 1, 0));

                    result.push(new DocumentSymbol(name, '', SymbolKind.Key, startAt, endAt));
                    
                } catch (error) {
                    console.log(error);
                }
                
            });

            const references = jclParser.extractReferences(parsedJob);
            const refGroup = new DocumentSymbol('References', 'References', SymbolKind.Namespace, new Range(new Position(0, 0), new Position(0, 0)), new Range(new Position(0, 0), new Position(0, 0)));
            result.push(refGroup);
            
            
            
            const kindMap = {
                'dd': {
                    description: 'DD File call',
                    kind: SymbolKind.File
                },
                'job': {
                    description: 'JOB Call',
                    kind: SymbolKind.Operator
                },
                'program': {
                    description: 'PROGRAM Call',
                    kind: SymbolKind.Interface
                },
            };
            const addedRefNames: string[] = [];
            const genericArrayMapper = (spec: Parsers.JobReferenceItem) => {
                const name = spec.reference.datasetName || 
                            spec.reference.jobName || 
                            spec.reference.program || 
                            spec.reference.programerName;
                if(!name || addedRefNames.indexOf(name) > -1){
                    return true;
                }
                addedRefNames.push(name);

                refGroup.children.push(new DocumentSymbol(name, kindMap[spec.type].description, kindMap[spec.type].kind, new Range(new Position(spec.startedAtLine - 1, 0), new Position(spec.startedAtLine - 1, 0)), new Range(new Position(spec.startedAtLine - 1, 0), new Position(spec.startedAtLine - 1, 0))));
                return true;
            };

            if(references.dd){
                references.dd.map(genericArrayMapper);
            }
            if(references.job){
                references.job.map(genericArrayMapper);
            }
            if(references.program){
                references.program.map(genericArrayMapper);
            }


            resolve(result);

        });
        
    }
    
}

export class JCLDefinitionProvider implements DefinitionProvider {
    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition> {
        return new Promise(async(resolve, reject) => {
            const programRegex = /EXEC[ ]{1,}PGM\=([a-zA-Z0-9#]+)/;

            const range = document.getWordRangeAtPosition(position, programRegex);
            if(!range) {
                return resolve(null);
            }
            const expr = document.getText(range);
            
            programRegex.lastIndex = -1;
            const result = programRegex.exec(expr);
            if(!result) {
                return resolve(null);
            }
            

            const files = await workspace.findFiles(`**/${result[1]}*`, undefined, 1, token);
            if(files.length === 0 ) {
                return resolve(null);
            }
            resolve(new Location(Uri.file(files[0].fsPath), new Range(0, 0, 10, 0)));
        });
    }
}
export class JCLProvider{
    public static activate(cxt: ExtensionContext){
        
        cxt.subscriptions.push(languages.registerHoverProvider(JCL_MODE, new JCLHoverProvider()));
        cxt.subscriptions.push(languages.registerReferenceProvider(JCL_MODE, new JCLReferenceProvider()));
        cxt.subscriptions.push(languages.registerDocumentSymbolProvider(JCL_MODE, new JCLDocumentSymbolProvider()));
        cxt.subscriptions.push(languages.registerWorkspaceSymbolProvider(new JCLWorkspaceSymbolProvider()));
        cxt.subscriptions.push(languages.registerDefinitionProvider(JCL_MODE, new JCLDefinitionProvider()));
    
    }
}