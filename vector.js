var Vector = (function () {
    "use strict";

    var Vector = function (x, y) {
        this.x = Math.floor(x || 0);
        this.y = Math.floor(y || 0);
    };

    // add two vectors together and return a new one
    Vector.prototype.add = function (v2) {
        return new Vector(this.x + v2.x, this.y + v2.y);
    };

    // add a vector to this one
    Vector.prototype.addTo = function (v2) {
        this.x += v2.x;
        this.y += v2.y;
    };

    // subtract two vectors and reutn a new one
    Vector.prototype.subtract = function (v2) {
        return new Vector(this.x - v2.x, this.y - v2.y);
    };

    // subtract a vector from this one
    Vector.prototype.subtractFrom = function (v2) {
        this.x -= v2.x;
        this.y -= v2.y;
    };

    // multiply this vector by a scalar and return a new one
    Vector.prototype.multiply = function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    };

    // multiply this vector by the scalar
    Vector.prototype.multiplyBy = function (scalar) {
        this.x = Math.floor(this.x * scalar);
        this.y = Math.floor(this.y * scalar);
    };

    // scale this vector by scalar and return a new vector
    Vector.prototype.divide = function (scalar) {
        return new Vector(this.x / scalar, this.y / scalar);
    };

    // scale this vector by scalar
    Vector.prototype.divideBy = function (scalar) {
        this.x = Math.floor(this.x / scalar);
        this.y = Math.floor(this.y / scalar);
    };

    // Utilities
    Vector.prototype.copy = function () {
        return new Vector(this.x, this.y);
    };

    Vector.prototype.toString = function () {
        return 'x: ' + this.x + ', y: ' + this.y;
    };

    Vector.prototype.toArray = function () {
        return [this.x, this.y];
    };

    Vector.prototype.toObject = function () {
        return {
            x: this.x,
            y: this.y
        };
    };

    return Vector;
}());
