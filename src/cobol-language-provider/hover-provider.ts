import { CancellationToken, Hover, HoverProvider, Position, TextDocument } from "vscode";

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
