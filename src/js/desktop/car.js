var GMath = require('./gmath');
var Vec2 = require('./vec2');

var Car = function(car, x, y) {
    this.health = 100;
    this.car = car;

    this.heading = 0.0;
    this.position = new Vec2(x, y);
    this.velocity = new Vec2();
    this.velocity_c = new Vec2();
    this.accel = new Vec2();
    this.accel_c = new Vec2();
    this.absVel = 0.0;
    this.yawRate = 0.0;
    this.steer = 0.0;
    this.steerAngle = 0.0;

    this.smoothSteer = true;
    this.safeSteer = true;

    this.inertia = 10.0;
    this.wheelBase = 0.0;
    this.axleWeightRatioFront = 0.0;
    this.axleWeightRatioRear = 0.0;

    this.gravity = 9.81;
    this.mass = 1200;
    this.inertiaScale = 1.0;
    this.halfWidth = 0.8;
    this.cgToFront = 2.0;
    this.cgToRear = 2.0;
    this.cgToFrontAxle = 1.25;
    this.cgToRearAxle = 1.25;
    this.cgHeight = 0.55;
    this.wheelRadius = 0.3;
    this.tireGrip = 5.0;
    this.lockGrip = 0.7;
    this.engineForce = 24000.0;
    this.brakeForce = 12000.0;
    this.eBrakeForce = this.brakeForce / 2.5;
    this.weightTransfer = 0.2;
    this.maxSteer = 0.7;
    this.cornerStiffnessFront = 5.0;
    this.cornerStiffnessRear = 5.2;
    this.airResist = 5;
    this.rollResist = 8.0;

    this.inertia = this.mass * this.inertiaScale;
    this.wheelBase = this.cgToFrontAxle + this.cgToRearAxle;
    this.axleWeightRatioFront = this.cgToRearAxle / this.wheelBase;
    this.axleWeightRatioRear = this.cgToFrontAxle / this.wheelBase;

    this.inputs = {
        left: 0,
        right: 0,
        throttle: 0.0,
        brake: 0,
        ebrake: 0
    };
};

/**
 * You are not expected to understand this.
 */
Car.prototype.doPhysics = function(dt, worldBounds, collisionBounds) {
    var sn = Math.sin(this.heading);
    var cs = Math.cos(this.heading);

    this.velocity_c.x = cs * this.velocity.x + sn * this.velocity.y;
    this.velocity_c.y = cs * this.velocity.y - sn * this.velocity.x;

    var axleWeightFront = this.mass * (this.axleWeightRatioFront * this.gravity - this.weightTransfer * this.accel_c.x * this.cgHeight / this.wheelBase);
    var axleWeightRear = this.mass * (this.axleWeightRatioRear * this.gravity + this.weightTransfer * this.accel_c.x * this.cgHeight / this.wheelBase);

    var yawSpeedFront = this.cgToFrontAxle * this.yawRate;
    var yawSpeedRear = -this.cgToRearAxle * this.yawRate;

    var slipAngleFront = Math.atan2(this.velocity_c.y + yawSpeedFront, Math.abs(this.velocity_c.x)) - GMath.sign(this.velocity_c.x) * this.steerAngle;
    var slipAngleRear = Math.atan2(this.velocity_c.y + yawSpeedRear, Math.abs(this.velocity_c.x));

    var tireGripFront = this.tireGrip;
    var tireGripRear = this.tireGrip * (1.0 - this.inputs.ebrake * (1.0 - this.lockGrip));

    var frictionForceFront_cy = GMath.clamp(-this.cornerStiffnessFront * slipAngleFront, -tireGripFront, tireGripFront) * axleWeightFront;
    var frictionForceRear_cy = GMath.clamp(-this.cornerStiffnessRear * slipAngleRear, -tireGripRear, tireGripRear) * axleWeightRear;

    var brake = Math.min(this.inputs.brake * this.brakeForce + this.inputs.ebrake * this.eBrakeForce, this.brakeForce);
    var throttle = this.inputs.throttle * this.engineForce;

    var tractionForce_cx = throttle - brake * GMath.sign(this.velocity_c.x);
    var tractionForce_cy = 0;

    var dragForce_cx = -this.rollResist * this.velocity_c.x - this.airResist * this.velocity_c.x * Math.abs(this.velocity_c.x);
    var dragForce_cy = -this.rollResist * this.velocity_c.y - this.airResist * this.velocity_c.y * Math.abs(this.velocity_c.y);

    var totalForce_cx = dragForce_cx + tractionForce_cx;
    var totalForce_cy = dragForce_cy + tractionForce_cy + Math.cos(this.steerAngle) * frictionForceFront_cy + frictionForceRear_cy;

    this.accel_c.x = totalForce_cx / this.mass;
    this.accel_c.y = totalForce_cy / this.mass;

    this.accel.x = cs * this.accel_c.x - sn * this.accel_c.y;
    this.accel.y = sn * this.accel_c.x + cs * this.accel_c.y;

    this.velocity.x += this.accel.x * dt;
    this.velocity.y += this.accel.y * dt;

    this.absVel = this.velocity.len();

    var angularTorque = (frictionForceFront_cy + tractionForce_cy) * this.cgToFrontAxle - frictionForceRear_cy * this.cgToRearAxle;

    if (Math.abs(this.absVel) < 0.5 && !throttle) {
        this.velocity.x = this.velocity.y = this.absVel = 0;

        angularTorque = this.yawRate = 0;
    }

    var angularAccel = angularTorque / this.inertia;

    this.yawRate += angularAccel * dt;
    this.heading += this.yawRate * dt;

    var oldPosition = {
        x0: this.position.x,
        y0: this.position.y,
        x1: this.position.x + this.car.width,
        y1: this.position.y + this.car.height
    };

    this.position.x += (this.velocity.x * 8) * dt;
    this.position.y += (this.velocity.y * 8) * dt;

    var newPosition = {
        x0: this.position.x,
        y0: this.position.y,
        x1: this.position.x + this.car.width,
        y1: this.position.y + this.car.height
    };

    // Detect the world boundaries.
    if (this.position.x < worldBounds.x0) {
        this.position.x = worldBounds.x0;
    }

    if (this.position.x > worldBounds.x1) {
        this.position.x = worldBounds.x1;
    }

    if (this.position.y < worldBounds.y0) {
        this.position.y = worldBounds.y0;
    }

    if (this.position.y > worldBounds.y1) {
        this.position.y = worldBounds.y1;
    }

    // Detect collisions with objects.
    for (var i = 0; i < collisionBounds.length; ++i) {
        if (
            this.position.x > collisionBounds[i].x0 &&
            this.position.y > collisionBounds[i].y0 &&
            this.position.x < collisionBounds[i].x1 &&
            this.position.y < collisionBounds[i].y1
        ) {
            // Collided from either the top or the bottom.
            if (
                (oldPosition.y1 < collisionBounds[i].y0 && newPosition.y1 >= collisionBounds[i].y0) ||
                (oldPosition.y0 >= collisionBounds[i].y1 && newPosition.y0 < collisionBounds[i].y1)
            ) {
                console.log('Colliding from top / bottom.');
            }

            // Collided from either the left or the right.
            if (
                (oldPosition.x1 < collisionBounds[i].x0 && newPosition.x1 >= collisionBounds[i].x0) ||
                (oldPosition.y0 >= collisionBounds[i].x1 && newPosition.y0 < collisionBounds[i].x1)
            ) {
                console.log('Colliding from right / left.');
            }

            // if (this.position.x > collisionBounds[i].x0 && this.position.x < collisionBounds[i].x1 - 10 && this.position.y > collisionBounds[i].y0) {
            //     this.position.x -= this.position.x - collisionBounds[i].x0;
            // }
            //
            // if (this.position.x < collisionBounds[i].x1 && this.position.x > collisionBounds[i].x0 + 10 && this.position.y > collisionBounds[i].y0) {
            //     this.position.x -= this.position.x - collisionBounds[i].x1;
            // }
            //
            // if (this.position.y > collisionBounds[i].y0 && this.position.y < collisionBounds[i].y1 - 10) {
            //     this.position.y -= this.position.y - collisionBounds[i].y0;
            // }
            //
            // if (this.position.y < collisionBounds[i].y1 && this.position.y > collisionBounds[i].y0 + 10) {
            //     this.position.y -= this.position.y - collisionBounds[i].y1;
            // }

            // if (this.position.x < collisionBounds[i].x1) {
            //     this.position.x = collisionBounds[i].x0;
            // } else {
            //     this.position.x = collisionBounds[i].x1;
            // }
            //
            // if (this.position.y < collisionBounds[i].y1) {
            //     this.position.y = collisionBounds[i].y0;
            // } else {
            //     this.position.y = collisionBounds[i].y1;
            // }
        }
    }

    this.car.children[0].rotation = this.heading;
    this.car.position.x = this.position.x;
    this.car.position.y = this.position.y;
};

Car.prototype.update = function(dtms, worldBounds, collisionBounds) {
    var dt = dtms / 1000.0;

    this.throttle = 0.0;
    this.brake = 0.0;
    this.steer = this.inputs.right - this.inputs.left;
    this.steerAngle = this.steer * this.maxSteer;

    this.doPhysics(dt, worldBounds, collisionBounds);
};

Car.prototype.setHealth = function(val) {
    this.health = val;

    this.car.children[1].value.width = 39 * (val / 100);
};

module.exports = Car;
