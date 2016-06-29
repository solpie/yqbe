interface CellObject {
    /*
     Key 	Description
     v 	raw value (see Data Types section for more info)
     w 	formatted text (if applicable)
     t 	cell type: b Boolean, n Number, e error, s String, d Date
     f 	cell formula (if applicable)
     r 	rich text encoding (if applicable)
     h 	HTML rendering of the rich text (if applicable)
     c 	comments associated with the cell **
     z 	number format string associated with the cell (if requested)
     l 	cell hyperlink object (.Target holds link, .tooltip is tooltip)
     s 	the style/theme of the cell (if applicable)
     */
    v:any;
    w:any;
    t:any;
    f:any;
    r:any;
    h:any;
    c:any;
    z:any;
    l:any;
    s:any;
}
export class BaseXLSX {
    isEmpty:boolean = false;
    isFake:boolean = false;
    _sheet:any;
    _row:number;

    constructor(sheet, row) {
        if (!sheet['A' + row]) {
            this.isEmpty = true;
        }
        else {
            this._row = row;
            this._sheet = sheet;
        }
    }

    col(abc):CellObject {
        return this._sheet[abc + this._row];
    }
}