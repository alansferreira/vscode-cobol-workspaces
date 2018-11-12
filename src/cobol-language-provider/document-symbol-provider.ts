import { ExtensionContext, languages, DocumentFilter, HoverProvider, TextDocument, Position, CancellationToken, Hover, ReferenceProvider, ReferenceContext, ProviderResult, Location, workspace,  WorkspaceSymbolProvider, SymbolInformation, DocumentSymbolProvider, SymbolKind, Range, DefinitionProvider, Definition, Uri, DocumentSymbol } from "vscode";
import * as Parsers from 'cobol-parsers';

const cobolParser = Parsers.program;
const copybookParser = Parsers.copybook;


export class COBOLDocumentSymbolProvider implements DocumentSymbolProvider {
    provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[] | DocumentSymbol[]> {
        return new Promise((resolve, reject) => {
            try {
                
                const parsedProgram = cobolParser.parseProgram(document.getText());
                const parsedBook = copybookParser.loadBook(document.getText());
                const result: DocumentSymbol[] = [];
                
                const field2Symbol = {
                    recursive: (stmts: Parsers.CopybookParsedStatement[]): DocumentSymbol[] => {
                        const result: DocumentSymbol[] = [];
                        let stmtSymbol;
                        let stmt;
                        for (let s = 0; s < stmts.length; s++) {
                            stmt = stmts[s];
                            stmtSymbol = field2Symbol[stmt.type](stmt);
                            if(stmt.fields) { stmtSymbol.children.push(...field2Symbol.recursive(stmt.fields)); }
                            
                            result.push(stmtSymbol);
                        }
                        return result;

                    },
                    'GROUP_ITEM': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.Class, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    'PICX': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.String, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;

                    },
                    'PIC9': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.Number, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;

                    },
                    'PICS9': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.Number, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;

                    },
                    'PIC_PLUS_9': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.Number, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;

                    },
                    'REDEFINES': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.Interface, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;

                    },
                    'COPY': (stmt: Parsers.CopybookParsedStatement): DocumentSymbol => {
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.type, SymbolKind.File, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;

                    },
                };


                const stmt2SymbolMap = {
                    recursive: (stmts: Parsers.ProgramParsedStatement[]): DocumentSymbol[]=>{
                        const result: DocumentSymbol[] = [];
                        let stmtSymbol;
                        let stmt;
                        for (let s = 0; s < stmts.length; s++) {
                            stmt = stmts[s];
                            stmtSymbol = stmt2SymbolMap[stmt.STMT_TYPE](stmt);
                            if(stmt.statements) { stmtSymbol.children.push(...stmt2SymbolMap.recursive(stmt.statements)); }
                            if(stmt.sections) { stmtSymbol.children.push(...stmt2SymbolMap.recursive(stmt.sections)); }
                            
                            result.push(stmtSymbol);
                        }
                        return result;
                    },
                    'DIVISION': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    'FILE_CONTROL': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    'SECTION': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.name;
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        
                        if(name.trim() === 'WORKING-STORAGE'){
                            symbol.children.push( ... field2Symbol.recursive(parsedBook));
                        }

                        return symbol;
                    },
                    'COPY': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.hardCodeCopySource || stmt.variableCopySource || '';
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    'EXEC_CICS': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.programName || '';
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    'EXEC_SQL': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.include || stmt.sqlStatement || '';
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    'CALL_PROGRAM': (stmt: Parsers.ProgramParsedStatement): DocumentSymbol=>{
                        const name = stmt.hardCodeProgramName || stmt.variableProgramName || stmt.usingData || '';
                        const symbol = new DocumentSymbol(name, stmt.STMT_TYPE, SymbolKind.EnumMember, new Range(stmt.startedAtLine -1, 0, stmt.endedAtLine -1, 8), new Range(stmt.startedAtLine -1, 7, stmt.endedAtLine -1, 7));
                        return symbol;
                    },
                    
                };


                if(parsedProgram.divisions) { result.push( ... stmt2SymbolMap.recursive(parsedProgram.divisions)); }
                if(parsedProgram.statements) { result.push( ... stmt2SymbolMap.recursive(parsedProgram.statements)); }


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
                
                resolve(result);
            } catch (error) {
                reject(error);
            }


        });
        
    }
    
}
