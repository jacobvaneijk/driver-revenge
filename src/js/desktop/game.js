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

        var width = level.width / 2 * 64;
        var height = level.height / 2 * 64;

        this.renderer.autoResize = true;
        this.renderer.resize(width, height);

        // Load all the land textures.
        var landTypes = {
            'asphalt': 91, // R-component [1-91]
            'dirt': 14, // G-component [1-14]
            'grass': 14, // B-component [1-14]
            'sand': 14 // A-component [1-14]
        };

        for (var type in landTypes) {
            for (var i = 1; i <= landTypes[type]; ++i) {
                PIXI.loader.add(type + '_' + i, 'img/land/' + type + '/' + (type === 'asphalt' ? 'road' : 'land') + '_' + type + (i <= 9 ? '0' : '') + i + '.png');
            }
        }

        PIXI.loader.load(function(loader, resources) {
            for (var x = 0; x < level.width / 2; ++x) {
                for (var y = 0; y < level.height / 2; ++y) {
                    var tile = new PIXI.Sprite(resources[self.getTileForColor(level.data[level.width / 2 * x + y])].texture);

                    tile.position.x = 64 * x;
                    tile.position.y = 64 * y;

                    tile.scale.x = 0.5;
                    tile.scale.y = 0.5;

                    self.stage.addChild(tile);
                }
            }
        });

        PIXI.loader.on('complete', function() {
            self.renderer.render(self.stage);
        });
    },

    getTileForColor: function(color) {
        if (color[0] !== 0) {
            return 'asphalt_' + color[0];
        }

        if (color[1] !== 0) {
            return 'dirt_' + color[1];
        }

        if (color[2] !== 0) {
            return 'grass_' + color[2];
        }

        if (color[3] !== 0) {
            return 'sand_' + color[3];
        }

        /*if (color[0] === 0 && color[1] === 255 && color[2] === 0) {
            return 'grass_4';
        }

        if (color[0] === 0 && color[1] === 0 && color[2] === 255) {
            return 'asphalt_72';
        }*/
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
