var Vector;

var Board = (function () {
    "use strict";

    function Board(w, h) {
        this.width = w;
        this.height = h;

        var j, i;
        this.cells = [];
        for (j = 0; j < h; j += 1) {
            this.cells[j] = [];
            for (i = 0; i < w; i += 1) {
                this.cells[j][i] = false;
            }
        }

    }

    Board.prototype.fillChar = '■';
    Board.prototype.emptyChar = '□';

    Board.prototype.print = function () {
        var i, j, oldfield, newfield, tr, td;
        newfield = document.createElement("tbody");
        newfield.id = "field";

        for (j = this.height - 1; j >= 0; j -= 1) {
            tr = document.createElement("tr");
            for (i = 0; i < this.width; i += 1) {
                td = document.createElement("td");
                td.textContent = this.cells[j][i] ? this.fillchar : this.emptyChar;
                tr.appendChild(td);
            }
            newfield.appendChild(tr);
        }
        document.getElementById("field").replaceWith(newfield);
    };

    return Board;
}());
