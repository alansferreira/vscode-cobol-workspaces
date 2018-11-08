import { ExtensionContext, languages, DocumentFilter, HoverProvider, TextDocument, Position, CancellationToken, Hover, ReferenceProvider, ReferenceContext, ProviderResult, Location, workspace,  WorkspaceSymbolProvider, SymbolInformation, DocumentSymbolProvider, SymbolKind, Range, DefinitionProvider, Definition, Uri, DocumentSymbol, window } from "vscode";
import * as fs from 'fs';
import * as Parsers from 'cobol-parsers';

// const cobolParser = Parsers.program;
const copyParser = Parsers.copybook;

function flattifyCopybook(copybook: Parsers.CopybookParsedStatement[], uri: Uri, query: string): SymbolInformation[]{

    const result: SymbolInformation[] = [];

    copybook.map((stmt) => {
        result.push(...flattifyCopybookField(stmt, uri, query));
    });


    return result;
}
function flattifyCopybookField(field: Parsers.CopybookParsedStatement, uri: Uri, query: string): SymbolInformation[]{
    const result: SymbolInformation[] = [];
    const name = field.name || field.src || '';
    const r = new RegExp(query, 'i');
    r.lastIndex = -1;

    if(r.test(name)){
        result.push(new SymbolInformation(name, SymbolKind.Variable,'', new Location(uri, new Range(1,1,1,1))));
    }

    if(!field.fields) { return result; }
    
    field.fields.map((stmt) => {
        result.push(...flattifyCopybookField(stmt, uri, query));
    });


    return result;
}

// activated by '#' on search menu
export class COBOLWorkspaceSymbolProvider implements WorkspaceSymbolProvider {
    provideWorkspaceSymbols(query: string, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        return new Promise(async (resolve, reject) => {
            
            if(query === '') { return reject(); }
            
            const symbols: SymbolInformation[] = [];
            
            // const files = await workspace.findFiles('**/*.{cob,cobol,cbl}');
            const files = await workspace.findFiles('**/*.{cob,cobol,cbl,cpy,copy,copybook}');
            
            for (let f = 0; f < files.length; f++) {
                try {
                    const file = files[f];
                    const parsed = copyParser.loadBook(fs.readFileSync(file.fsPath).toString());
                    
                    symbols.push(...flattifyCopybook(parsed, file, query));
                } catch (error) { }
            }
            
            resolve(symbols);
        });
        
    }
}