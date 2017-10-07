var Vector;

var Board = (function () {
    "use strict";

    // extend standard Object with helper function
    // picks random element within enumerable attribute
    Object.prototype.pickRandomEnum = function () {
        var keys = Object.keys(this);
        return this[keys[Math.floor(Math.random() * (keys.length))]];
    };

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

    Board.prototype.blocks = {
        "O": [
            new Vector(-1, 0),
            new Vector(0, 0),
            new Vector(-1, 1),
            new Vector(0, 1)
        ],

        "I": [
            new Vector(-2, 0),
            new Vector(-1, 0),
            new Vector(0, 0),
            new Vector(1, 0)
        ],

        random: undefined
    };

    Object.defineProperty(Board.prototype.blocks, "random", {
        value: function () {
            return Board.prototype.blocks.pickRandomEnum().slice();
        },
        enumerable: false
    });

    Board.prototype.print = function () {
        var i, j, oldfield, newfield, tr, td;
        newfield = document.createElement("tbody");
        newfield.id = "field";

        for (j = this.height - 1; j >= 0; j -= 1) {
            tr = document.createElement("tr");
            for (i = 0; i < this.width; i += 1) {
                td = document.createElement("td");
                td.textContent = this.cells[j][i] ? this.fillChar : this.emptyChar;
                tr.appendChild(td);
            }
            newfield.appendChild(tr);
        }
        document.getElementById("field").replaceWith(newfield);
    };

    return Board;
}());
