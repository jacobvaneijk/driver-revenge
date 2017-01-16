var Connections = require('./connections');

module.exports = {
    spawnpoints: [],
    renderer: null,
    socket: null,
    stage: null,
    level: [],

    init: function(socket) {
        this.socket = socket;

        this.renderer = new PIXI.autoDetectRenderer(800, 600);
        this.stage = new PIXI.Container();

        $('body').append(this.renderer.view);
    },

    loadLevel: function(level) {
        var self = this;

        var width = level.width * 64;
        var height = (level.height / 2) * 64;

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

                    // object.scale.x = 0.5;
                    // object.scale.y = 0.5;

                    self.stage.addChild(object);
                }
            }
        });

        PIXI.loader.on('complete', function() {
            self.renderer.render(self.stage);
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

    renderCars: function() {
        var colors = [ 'black', 'blue', 'green', 'red', 'yellow' ];
        var self = this;

        // Load the car textures.
        for (var i = 0; i < colors.length; ++i) {
            PIXI.loader.add('car_' + colors[i], 'img/cars/car_' + colors[i] + '.png');
        }

        // Add the players to the stage.
        PIXI.loader.load(function(loader, resources) {
            for (var i = 0; i < Connections.connections.length; ++i) {
                var car = new PIXI.Sprite(resources['car_' + colors[i]].texture);

                car.position.x = self.spawnpoints[i].x;
                car.position.y = self.spawnpoints[i].y;

                car.scale.x = .4;
                car.scale.y = .4;

                car.anchor.x = 0.5;
                car.anchor.y = 0.5;

                self.stage.addChild(car);
            }
        });
    }
};
