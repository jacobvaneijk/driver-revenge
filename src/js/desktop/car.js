var Victor = require('victor');

var Car = function(sprite, position) {
    // State
    this.heading    = 5.0; // The angle (in radians) the car is pointed at.
    this.position   = position; // The position in the level.
    this.steering   = 0.0; // The amount of steering input.
    this.speed      = 10; // The speed of the car. Duh.
    this.drag       = 0; // How fast the car slows down.

    // Configuration
    this.wheelBase = sprite.height / 2;

    // Other
    this.sprite = sprite;
    this.sprite.position.x = this.position.x;
    this.sprite.position.y = this.position.y;
};

Car.prototype.doPhysics = function(deltaTime) {
    var frontWheel = this.position.clone().add(new Victor(this.wheelBase / 2, this.wheelBase / 2)).multiply(new Victor(Math.cos(this.heading), Math.sin(this.heading)));
    var backWheel = this.position.clone().subtract(new Victor(this.wheelBase / 2, this.wheelBase / 2)).multiply(new Victor(Math.cos(this.heading), Math.sin(this.heading)));

    //console.log(this.position.addX(this.wheelBase / 2).addY(this.wheelBase / 2).toString());
    //console.log(frontWheel.toString(), backWheel.toString());

    console.log(frontWheel.toString());
};

module.exports = Car;
