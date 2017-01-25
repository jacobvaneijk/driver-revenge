var Connections = require('./connections');
var GMath = require('./gmath');
var Car = require('./car');

module.exports = {
    collisionBounds: [],
    previousTime: null,
    worldBounds: {},
    renderer: null,
    socket: null,
    stage: null,
    level: [],
    cars: [],

    init: function(socket) {
        this.socket = socket;

        this.previousTime = Date.now();
        this.renderer = new PIXI.autoDetectRenderer(800, 600);
        this.stage = new PIXI.Container();

        $('body').append(this.renderer.view);
    },

    loadLevel: function(level) {
        var self = this;

        var width = level.width * 64;
        var height = (level.height / 2) * 64;

        this.worldBounds = {
            x0: 35,
            y0: 35,
            x1: level.width * 64 - 35,
            y1: (level.height / 2) * 64 - 35
        };

        this.renderer.autoResize = true;
        this.renderer.resize(width, height);

        // Load all the land textures.
        var landTypes = {
            'grass': 14, // R-component [10-140]
            'dirt': 14, // G-component [10-140]
            'sand': 14 // B-component [10-140]
        };

        for (var type in landTypes) {
            for (var i = 1; i <= landTypes[type]; ++i) {
                PIXI.loader.add(type + '_' + i, 'img/land/' + type + '/land_' + type + (i <= 9 ? '0' : '') + i + '.png');
            }
        }

        // Load all the objects.
        for (var i = 1; i <= 14; ++i) {
            PIXI.loader.add('object_' + i, 'img/objects/object_' + (i <= 9 ? '0' : '') + i + '.png');
        }

        // Load the level.
        PIXI.loader.load(function(loader, resources) {
            for (var x = 0; x < level.width; ++x) {
                for (var y = 0; y < level.height / 2; ++y) {
                    var resourceName = self.getTileForColor(level.data[x * level.height + y]);

                    if (resourceName === null) {
                        continue;
                    }

                    var tile = new PIXI.Sprite(resources[resourceName].texture);

                    tile.position.x = 64 * x;
                    tile.position.y = 64 * y;

                    tile.scale.x = 0.5;
                    tile.scale.y = 0.5;

                    self.stage.addChild(tile);
                }
            }

            for (var x = 0; x < level.width; ++x) {
                for (var y = level.height / 2; y < level.height; ++y) {
                    var resourceName = self.getObjectForColor(level.data[x * level.height + y]);

                    if (resourceName === null) {
                        continue;
                    }

                    var object = new PIXI.Sprite(resources[resourceName].texture);

                    object.position.x = 64 * x;
                    object.position.y = 64 * (y - level.height / 2);

                    self.collisionBounds.push({
                        x0: object.position.x - 32,
                        y0: object.position.y - 32,
                        x1: object.position.x + object.width + 32,
                        y1: object.position.y + object.height + 32
                    });

                    var bounds = new PIXI.Graphics();

                    bounds.beginFill(0xFF0000);
                    bounds.drawRect(object.position.x, object.position.y, object.width, object.height)

                    self.stage.addChild(bounds);
                    self.stage.addChild(object);
                }
            }
        });

        this.createCars();

        PIXI.loader.on('complete', function() {
            self.update();
        });
    },

    getTileForColor: function(color) {
        if (color[0] !== 0) {
            return 'grass_' + (color[0] / 10);
        }

        if (color[1] !== 0) {
            return 'dirt_' + (color[1] / 10);
        }

        if (color[2] !== 0) {
            return 'sand_' + (color[2] / 10);
        }

        return null;
    },

    getObjectForColor: function(color) {
        if (color[2] !== 255) {
            return 'object_' + (color[2] / 10);
        }

        return null;
    },

    update: function() {
        var self = this;

        var currentTime = Date.now();
        var deltaTime = currentTime - this.previousTime;

        if (deltaTime > 0) {
            if (deltaTime > 100) {
                this.previousTime += deltaTime - 100;
                deltaTime = 100;
            }

            for (var i = 0; i < this.cars.length; ++i) {
                this.cars[i].update(deltaTime, this.worldBounds, this.collisionBounds);
            }

            this.previousTime = currentTime;
        }

        this.renderer.render(this.stage);

        requestAnimationFrame(function() {
            self.update();
        });
    },

    createCars: function() {
        var self = this;
        var colors = ['black', 'blue', 'green', 'red', 'yellow'];

        // Load car textures.
        for (var i = 0; i < colors.length; ++i) {
            PIXI.loader.add('car_' + colors[i], 'img/cars/car_' + colors[i] + '.png');
        }

        // Create a new car for every connection.
        PIXI.loader.load(function(loader, resources) {
            for (var i = 0; i < Connections.connections.length; ++i) {
                var container = new PIXI.Container();

                var car = new PIXI.Sprite(resources['car_' + colors[i]].texture);
                var healthBar = new PIXI.DisplayObjectContainer();

                container.addChild(car);
                container.addChild(healthBar);

                car.anchor.x = 0.5;
                car.anchor.y = 0.5;
                car.scale.x = 0.5;
                car.scale.y = 0.5;

                // Draw the healthbar's border.
                var healthBarBackground = new PIXI.Graphics();
                healthBarBackground.beginFill(0xF21515, 1);
                healthBarBackground.lineStyle(2, 0x000000, 1);
                healthBarBackground.drawRect(0, 0, 40, 8);
                healthBarBackground.endFill();
                healthBar.addChild(healthBarBackground);

                // Draw the healthbar's value.
                var healthBarValue = new PIXI.Graphics();
                healthBarValue.beginFill(0x3AF215);
                healthBarValue.drawRect(0, 1, 39, 6);
                healthBarValue.endFill();
                healthBar.addChild(healthBarValue);
                healthBar.value = healthBarValue;

                self.stage.addChild(container);

                self.cars.push(new Car(container, 400 * (i + 1), 100));
            }
        });
    },

    throttle: function(index) {
        this.cars[index].inputs.throttle = 1.0;
        this.cars[index].inputs.rollResist = 8.0;

        this.cars[index].setHealth(
            this.cars[index].health - 10
        );
    },

    brake: function(index) {
        this.cars[index].inputs.throttle = 0;
        this.cars[index].inputs.rollResist = 200;
    },

    steer: function(index, steering) {
        if (typeof this.cars[index] === 'undefined') {
            return;
        }

        // Neutral
        if (steering > -1 && steering <= 1) {
            this.cars[index].inputs.right = 0;
            this.cars[index].inputs.left = 0;
        }

        // Right
        if (steering > 1 && steering <= 2.5) {
            this.cars[index].inputs.right = 0.1;
        } else if (steering > 2.5 && steering <= 4.5) {
            this.cars[index].inputs.right = 0.3;
        } else if (steering > 4.5 && steering <= 7) {
            this.cars[index].inputs.right = 0.6;
        } else if (steering > 7 && steering < 10) {
            this.cars[index].inputs.right = 1.0;
        }

        // Left
        if (steering < -1 && steering >= -2.5) {
            this.cars[index].inputs.left = 0.1;
        } else if (steering < -2.5 && steering >= -4.5) {
            this.cars[index].inputs.left = 0.3;
        } else if (steering < -4.5 && steering >= -7) {
            this.cars[index].inputs.left = 0.6;
        } else if (steering < -7 && steering > -10) {
            this.cars[index].inputs.left = 1.0;
        }
    }
};
