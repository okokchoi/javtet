var Vector;

var Board = (function () {
    "use strict";

    // extend standard Object with helper function
    // picks random element within enumerable attribute
    Object.prototype.pickRandomEnum = function () {
        var keys = Object.keys(this);
        return this[keys[Math.floor(Math.random() * (keys.length))]];
    };

    // constructor
    function Board(w, h) {
        var j, i, spawnPoint;

        this.width = w;
        this.height = h;

        // clear board
        this.cells = [];
        for (j = 0; j < h; j += 1) {
            this.cells[j] = [];
            for (i = 0; i < w; i += 1) {
                this.cells[j][i] = false;
            }
        }

        spawnPoint = new Vector(this.width / 2, this.height - 1);
        // array of currently movable cells (aka block)
        this.nowBlock = this.blocks.random().map(function (v) {
            return v.add(spawnPoint);
        });
    }

    // static standard tiles
    Board.prototype.fillChar = '■';
    Board.prototype.emptyChar = '□';

    // static standard block forms
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

    // this function is not enumerable
    // return new copy of randomly pick blocks
    Object.defineProperty(Board.prototype.blocks, "random", {
        value: function () {
            return Board.prototype.blocks.pickRandomEnum().slice();
        },
        enumerable: false
    });

    // print board to page
    Board.prototype.print = function () {
        var i, j, oldfield, newfield, tr, td, fc, h;
        newfield = document.createElement("tbody");
        newfield.id = "field";

        // stacked blocks
        for (j = this.height - 1; j >= 0; j -= 1) {
            tr = document.createElement("tr");
            for (i = 0; i < this.width; i += 1) {
                td = document.createElement("td");
                td.textContent = this.cells[j][i] ? this.fillChar : this.emptyChar;
                tr.appendChild(td);
            }
            newfield.appendChild(tr);
        }

        // current block
        fc = this.fillChar;
        h = this.height;
        this.nowBlock.forEach(function (v) {
            newfield.children[h - v.y].children[v.x].textContent = fc;
        });

        document.getElementById("field").replaceWith(newfield);
    };

    return Board;
}());
