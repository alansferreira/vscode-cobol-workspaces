import { ExtensionContext, languages, DocumentFilter, HoverProvider, TextDocument, Position, CancellationToken, Hover, ReferenceProvider, ReferenceContext, ProviderResult, Location, workspace, window, WorkspaceSymbolProvider, SymbolInformation, DocumentSymbolProvider, SymbolKind, Range, DefinitionProvider, Definition, Uri } from "vscode";
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
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        return new Promise((resolve, reject) => {
            
            const parsedJob = jclParser.parseJob(document.getText());
            const result: SymbolInformation[] = parsedJob.statements.map((stmt) => {
                const range = new Range(stmt.startedAtLine - 1, 0, stmt.endedAtLine - 1, 0);
                let name = `${stmt.STMT_TYPE}: ${stmt.jobName || stmt.labelName} ${stmt.datasetName || stmt.program || stmt.commandArgs}`;

                return new SymbolInformation(name, SymbolKind.Method, range, document.uri);

            });

            //jclParser.extractReferences(parsedJob);

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