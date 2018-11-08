import { DocumentFilter, ExtensionContext, languages } from "vscode";
import { COBOLHoverProvider } from "./hover-provider";
import { COBOLReferenceProvider } from "./reference-provider";
import { COBOLDocumentSymbolProvider } from "./document-symbol-provider";
import { COBOLWorkspaceSymbolProvider } from "./workspace-symbol-provider";
import { COBOLDefinitionProvider } from "./definition-provider";

const COBOL_MODE: DocumentFilter = { language: 'COBOL', scheme: 'file' };

export class COBOLProvider{
    public static activate(cxt: ExtensionContext){
        
        cxt.subscriptions.push(languages.registerHoverProvider(COBOL_MODE, new COBOLHoverProvider()));
        cxt.subscriptions.push(languages.registerReferenceProvider(COBOL_MODE, new COBOLReferenceProvider()));
        cxt.subscriptions.push(languages.registerDocumentSymbolProvider(COBOL_MODE, new COBOLDocumentSymbolProvider()));
        cxt.subscriptions.push(languages.registerWorkspaceSymbolProvider(new COBOLWorkspaceSymbolProvider()));
        cxt.subscriptions.push(languages.registerDefinitionProvider(COBOL_MODE, new COBOLDefinitionProvider()));
    
    }
}