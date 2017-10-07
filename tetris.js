var Vector;

var Board = (function () {
    "use strict";

    // extend standard Object with helper function
    // picks random element within enumerable attribute
    Object.prototype.pickRandomEnum = function () {
        var keys = Object.keys(this);
        return this[keys[Math.floor(Math.random() * (keys.length))]];
    };

    Array.prototype.all = function (f) {
        return this.reduce(function (b, x) {
            return b && f(x);
        }, true);
    };

    /*
        coordinates origin is left bottom.
        it is form of well, (floor, walls but no ceiling)
        width and height indicates size of field.
        so that height != well height == infinite
    */

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

        // FIXME spawn.y should be movable
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

    // check if you can fill the position (assuming infinite height)
    Board.prototype.oktoFill = function (v) {
        if (0 <= v.x && v.x < this.width && 0 <= v.y) {
            return !this.cells[v.y] || !this.cells[v.y][v.x];
        }
        return false;
    };

    // move nowBlock by amount of `v`
    // returns if move was successful, nothing changes if false.
    Board.prototype.moveNow = function (move) {
        var laterBlock, ok;
        ok = this.oktoFill.bind(this);
        laterBlock = this.nowBlock.slice().map(function (v) {
            var m = v.add(move);
            return ok(m) ? m : null;
        });

        if (laterBlock.all(function (v) {
                return v !== null;
            })) {
            this.nowBlock = laterBlock;
            return true;
        } else {
            return false;
        }
    };

    // print board to page
    Board.prototype.print = function () {
        var i, j, oldfield, newfield, tr, td, fc, h, ok;
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
        ok = this.oktoFill.bind(this);
        this.nowBlock.forEach(function (v) {
            if (ok(v) && v.y < h) {
                newfield.children[h - 1 - v.y].children[v.x].textContent = fc;
            }
        });

        document.getElementById("field").replaceWith(newfield);
    };

    return Board;
}());

var board = new Board(6, 10);
window.addEventListener('keydown', function (event) {
    function mv(x, y) {
        if (board.moveNow(new Vector(x, y))) {
            board.print()
        }
    }
    switch (event.keyCode) {
        case 39: // Right
            mv(1, 0);
            break;
        case 37: //Left
            mv(-1, 0);
            break;
        case 40: // Down
            mv(0, -1);
            break;
        case 38: // Up -- TODO only for debugging purpose
            mv(0, 1);
            break;
    }
}, false);
