var Vector;
var console;
var HTMLElement;

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

    HTMLElement.prototype.appendNewChild = function (type) {
        var child = document.createElement(type);
        this.appendChild(child);
        return child;
    };

    /*
        coordinates origin is left bottom.
        it is form of well, (floor, walls but no ceiling)
        width and height indicates size of well.
        so that height != well height == infinite
    */

    // constructor
    // w: well width
    // h: visible well height
    // div: division id to print game on
    function Board(w, h, div) {
        var pbtn;

        this.width = w;
        this.height = h;

        // allocate the cells, initialize as empty
        // FIXME don't need to allocate'em all, we can allocate as we need them.
        this.cells = [];
        this.resizeWell(this.height);

        this.genRandomNow();

        this.divid = div || "tetris";
        div = document.getElementById(this.divid);
        if (!div) {
            console.log('could not find DOM element named "' + this.divid + '"');
            console.assert(div);
        }

        // set html structure
        div.className = "tetris";
        div.appendNewChild("table").appendNewChild("tbody").className = "well";
        pbtn = div.appendNewChild("button");
        pbtn.className = "pause";
        pbtn.textContent = "pause";
        pbtn.onclick = this.toggleRun.bind(this);

        this.handle = null;
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
            return this.cells.length <= v.y || !this.cells[v.y][v.x];
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

    // spawn random nowBlock at top of the field.
    // TODO need to check game over
    Board.prototype.genRandomNow = function () {
        // FIXME spawn.y should be movable
        var spawnPoint = new Vector(this.width / 2, this.height - 1);
        // array of currently movable cells (aka block)
        this.nowBlock = this.blocks.random().map(function (v) {
            return v.add(spawnPoint);
        });
    };

    // extend height of well by h
    Board.prototype.resizeWell = function (h) {
        var from, to, j, i;
        from = this.cells.length;
        to = h + this.cells.length;
        for (j = from; j < to; j += 1) {
            this.cells[j] = [];
            for (i = 0; i < this.width; i += 1) {
                this.cells[j][i] = false;
            }
        }
    };

    Board.prototype.step = function () {
        var cells, need, row, ext;
        if (!this.moveNow(new Vector(0, -1))) { // nowhere to down

            // stack the current block
            cells = this.cells;
            ext = this.resizeWell.bind(this);
            this.nowBlock.forEach(function (v) {
                if (cells.length <= v.y) { // need more
                    ext(v.y - cells.length + 1);
                }
                cells[v.y][v.x] = true;
            });

            // erase full rows
            this.cells = cells.filter(function (bs) {
                return !bs.all(function (b) {
                    return b;
                });
            });

            // FIXME I have to keep the size since `print` rely on cells
            if (this.cells.length < this.height) {
                this.resizeWell(this.height - this.cells.length);
            }

            // gen new block
            this.genRandomNow();
        }
        this.print();
    };

    Board.prototype.getElem = function (name) {
        return document.getElementById(this.divid).getElementsByClassName(name)[0];
    };

    // print board to page
    Board.prototype.print = function () {
        var i, j, oldWell, newWell, tr, td, fc, h, ok;
        newWell = document.createElement("tbody");
        newWell.className = "well";

        // stacked blocks
        for (j = this.height - 1; j >= 0; j -= 1) {
            tr = document.createElement("tr");
            for (i = 0; i < this.width; i += 1) {
                td = document.createElement("td");
                td.textContent = this.cells[j][i] ? this.fillChar : this.emptyChar;
                tr.appendChild(td);
            }
            newWell.appendChild(tr);
        }

        // current block
        fc = this.fillChar;
        h = this.height;
        ok = this.oktoFill.bind(this);
        this.nowBlock.forEach(function (v) {
            if (ok(v) && v.y < h) {
                newWell.children[h - 1 - v.y].children[v.x].textContent = fc;
            }
        });

        this.getElem("well").replaceWith(newWell);
    };

    Board.prototype.toggleRun = function () {
        if (this.handle === null) {
            this.handle = window.setInterval(this.step.bind(this), 1500);
        } else {
            window.clearInterval(this.handle);
            this.handle = null;
        }
    };

    return Board;
}());

var board;
var handle;

window.onload = function () {
    board = new Board(6, 10);
    board.print();
    window.addEventListener('keydown', function (event) {
        function mv(x, y) {
            if (board.moveNow(new Vector(x, y))) {
                board.print();
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
}
