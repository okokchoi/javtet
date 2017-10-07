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

    return Board;
}());
