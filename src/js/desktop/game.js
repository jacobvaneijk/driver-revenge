var Connections = require('./connections');

module.exports = {
    spawnpoints: [],
    renderer: null,
    socket: null,
    stage: null,
    level: null,

    init: function(socket) {
        this.socket = socket;

        this.renderer = new PIXI.autoDetectRenderer(800, 600);
        this.stage = new PIXI.Container();

        $('body').append(this.renderer.view);
    },

    loadLevel: function(level) {
        var self = this;

        this.level = level;

        var width = Math.floor($('body').innerWidth() / this.level.tile_width) * this.level.tile_width;
        var height = Math.floor($('body').innerHeight() / this.level.tile_height) * this.level.tile_height;

        this.renderer.autoResize = true;
        this.renderer.resize(width, height);

        // Load all land textures (14 in total).
        for (var i = 1; i <= 14; ++i) {
            PIXI.loader.add('land_' + i, 'img/land/' + this.level.land + '/land_' + this.level.land + (i <= 9 ? '0' : '') + i + '.png');
        }

        // Load all asphalt textures (90 in total).
        for (var i = 1; i <= 90; ++i) {
            PIXI.loader.add('asphalt_' + i, 'img/land/asphalt/road_asphalt' + (i <= 9 ? '0' : '') + i + '.png');
        }

        var tile_objects = [
            'barrel_blue',
            'barrel_blue_down',
            'barrel_red',
            'barrel_red_down',
            'barrier_red',
            'barrier_white',
            'cone_down',
            'cone_straight',
            'oil',
            'rock1',
            'rock2',
            'rock3',
            'tree_large',
            'tree_small'
        ];

        // Load all objects textures.
        for (var i = 0; i < tile_objects.length; ++i) {
            PIXI.loader.add(tile_objects[i], 'img/objects/' + tile_objects[i] + '.png');
        }

        PIXI.loader.load(function (loader, resources) {
            self.stage.addChild(new PIXI.extras.TilingSprite(resources[self.level.background].texture, self.renderer.width, self.renderer.height));

            // Load object textures and add them to the stage.
            for (var i = 0; i < self.level.objects.length; ++i) {
                var object = self.level.objects[i];
                var objectContainer = new PIXI.Container();

                var count = 0;

                for (var x = 0; x < object.height; ++x) {
                    for (var y = 0; y < object.width; ++y) {
                        var objectTile = new PIXI.Sprite(resources[object.data[count++]].texture);

                        objectTile.position.x = self.level.tile_height * y;
                        objectTile.position.y = self.level.tile_width * x;

                        if (typeof object.scale !== 'undefined') {
                            objectTile.scale.x = object.scale.x;
                            objectTile.scale.y = object.scale.y;
                        }

                        if (typeof object.rotation !== 'undefined') {
                            objectTile.rotation = object.rotation;
                        }

                        if (typeof object.anchor !== 'undefined') {
                            objectTile.anchor.x = object.anchor.x;
                            objectTile.anchor.y = object.anchor.y;
                        }

                        if (typeof object.type !== 'undefined') {
                            switch (object.type) {
                                case 'spawnpoint':
                                    var offsetX = 0;
                                    var offsetY = 0;

                                    if (typeof object.spawnpointOffset !== 'undefined') {
                                        offsetX = self.level.tile_height * object.spawnpointOffset.x;
                                        offsetY = self.level.tile_height * object.spawnpointOffset.y;
                                    }

                                    self.spawnpoints.push({
                                        x: self.level.tile_height * object.position.x + offsetX,
                                        y: self.level.tile_width * object.position.y + offsetY
                                    });

                                    break;
                            }
                        }

                        objectContainer.addChild(objectTile);
                    }
                }

                objectContainer.position.x = self.level.tile_height * object.position.x;
                objectContainer.position.y = self.level.tile_width * object.position.y;

                self.stage.addChild(objectContainer);
            }
        });

        this.renderCars();

        PIXI.loader.on('complete', function() {
            self.renderer.render(self.stage);
        });
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
