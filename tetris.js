var Vector;
var console;
var HTMLElement;

/* Scheme of game display

<div id="tetris" class="tetris">
    <table class="well" style="color: darkgrey;">
        <tbody class="well">...</tbody>
    </table>
    <button class="pause" onclick='board.toggleRun()'>
        pause
    </button>
</div>
*/

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
    function Board(w, h, div, keymap) {
        var wtbl, pbtn;

        this.width = w;
        this.height = h;

        // allocate the cells, initialize as empty
        // FIXME don't need to allocate'em all, we can allocate as we need them.
        this.cells = [];
        this.resizeWell(this.height);

        // Note. the first point of block is the anchor for rotation
        // caution needed when modifying block.
        this.block = undefined;
        this.genRandomNow();

        this.divid = div || "tetris";
        div = document.getElementById(this.divid);
        if (!div) {
            console.log('could not find DOM element named "' + this.divid + '"');
            console.assert(div);
        }

        // set html structure
        div.className = "tetris";

        wtbl = div.appendNewChild("table");
        wtbl.className = "well";
        wtbl.appendNewChild("tbody");

        pbtn = div.appendNewChild("button");
        pbtn.className = "pause";
        pbtn.textContent = "pause";
        pbtn.onclick = this.toggleRun.bind(this);

        this.handle = null;

        this.getElem().setAttribute("tabindex", 0);
        this.keyListener = null;
        this.registerKeymap(keymap);
    }

    // static standard tiles
    Board.prototype.fillCode = 0x25A0;
    Board.prototype.emptyCode = 0x25A1;

    // static standard block forms
    // the first point is the anchor for rotation
    Board.prototype.blocks = {
        "O": [
            new Vector(0, 0),
            new Vector(-1, 0),
            new Vector(-1, 1),
            new Vector(0, 1)
        ],

        "I": [
            new Vector(0, 0),
            new Vector(-2, 0),
            new Vector(-1, 0),
            new Vector(1, 0)
        ],

	"S": [
	    new Vector(0, 0),
	    new Vector(1, 0),
	    new Vector(0, 1),
	    new Vector(-1, 1)
        ],

        random: undefined
    };

    // this function is not enumerable
    // return new copy of randomly pick blocks
    // FIXME this function is dangerous, it returns shallow copy of vector array
    // when using return value of this function, it should be read - only.
    Object.defineProperty(Board.prototype.blocks, "random", {
        value: function () {
            return Board.prototype.blocks.pickRandomEnum().slice();
        },
        enumerable: false
    });

    // default keymap for interacte with game
    Board.prototype.defaultKeymap = {
        39: "right", // Right arrow
        37: "left", // Left arrow
        40: "down", // Down arrow
        38: "up", // Up arrow -- only for debugging purpose
        82: "rotate", // 'R'
        85: "etator" // 'U'
    };

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
            // v should be used READ ONLY
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

    Board.prototype.rotateNow = function (dir) {
        var laterBlock, anchor;
        dir /= Math.abs(dir);
        anchor = this.nowBlock[0].copy();

        laterBlock = this.nowBlock.slice().map(function (v) {
            // v should be READ ONLY
            v = v.subtract(anchor);
            v.y = -[v.x, v.x = v.y][0]; // swap
            return v.multiplyBy(dir).addTo(anchor);
        });

        if (laterBlock.all(this.oktoFill.bind(this))) {
            this.nowBlock = laterBlock;
            return true;
        } else {
            return false;
        }
    };

    Board.prototype.registerKeymap = function (keymap) {
        var thos = this;
        keymap = this.keymap = keymap || this.defaultKeymap;

        // FIXME these should be private function
        // but they don't have to be evaluated at every
        // invocation of registerKeymap function
        function mv(x, y) {
            if (thos.moveNow(new Vector(x, y))) {
                thos.print();
            }
        }

        function rt(d) {
            if (thos.rotateNow(d)) {
                thos.print();
            }
        }

        if (this.keyListener !== null) {
            this.getElem().removeEventListener('keydown', this.keyListener, false);
        }

        this.keyListener = (function (event) {
            switch (this.keymap[event.keyCode]) {
                case "right":
                    mv(1, 0);
                    break;
                case "left":
                    mv(-1, 0);
                    break;
                case "down":
                    mv(0, -1);
                    break;
                case "up":
                    mv(0, 1);
                    break;
                case "rotate":
                    rt(1);
                    break;
                case "etator":
                    rt(-1);
                    break;
            }
        }).bind(this);

        this.getElem().addEventListener('keydown', this.keyListener, false);
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

    // find HTMLElement among children of `divid.
    // .[name] indicates class name
    // [name] indicates tag name
    // sequence of names indicate descendants
    // Note. each step of descendant search uses 'maximum munch' policy
    Board.prototype.getElem = function (sels) {
        var now = document.getElementById(this.divid);
        if (sels === undefined) return now;

        sels.split(' ').forEach(function (sel) {
            switch (sel[0]) {
                case '.': // class
                    now = now.getElementsByClassName(sel.slice(1))[0];
                    break;
                default: // tag
                    now = now.getElementsByTagName(sel)[0];
                    break;
            }
        });
        return now;
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
                var code = this.cells[j][i] ? this.fillCode : this.emptyCode;
                td.textContent = String.fromCharCode(code);
                tr.appendChild(td);
            }
            newWell.appendChild(tr);
        }

        // current block
        fc = String.fromCharCode(this.fillCode);
        h = this.height;
        ok = this.oktoFill.bind(this);
        this.nowBlock.forEach(function (v, i) {
            if (ok(v) && v.y < h) {
                newWell.children[h - 1 - v.y].children[v.x].textContent = fc;

                if (i == 0) {
                    newWell.children[h - 1 - v.y].children[v.x].style.color = "red";

                }
            }
        });

        this.getElem(".well tbody").replaceWith(newWell);
    };

    Board.prototype.toggleRun = function () {
        if (this.handle === null) {
            this.handle = window.setInterval(this.step.bind(this), 1500);
            this.getElem(".well").style.color = "black";
        } else {
            window.clearInterval(this.handle);
            this.handle = null;
            this.getElem(".well").style.color = "darkgrey";
        }
    };

    return Board;
}());

/* reference to look for candidate tile character
 https://en.wikipedia.org/wiki/Geometric_Shapes#Font_coverage
 https://en.wikipedia.org/wiki/Block_Elements
 https://en.wikipedia.org/wiki/Box_Drawing
 https://en.wikipedia.org/wiki/Semigraphics
 https://en.wikipedia.org/wiki/Tombstone_(typography)
 */
