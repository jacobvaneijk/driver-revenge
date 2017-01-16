var Victor = require('victor');
var Connections = require('./connections');
var Car = require('./car');

module.exports = {
    previousTime: null,
    renderer: null,
    socket: null,
    stage: null,
    level: null,
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

        this.level = level;

        var width = Math.floor($('body').innerWidth() / this.level.tile_width) * this.level.tile_width;
        var height = Math.floor($('body').innerHeight() / this.level.tile_height) * this.level.tile_height;

        this.renderer.autoResize = true;
        this.renderer.resize(width, height);

        // Load all land textures (14 in total).
        for (var i = 1; i <= 14; ++i) {
            PIXI.loader.add('land_' + i, 'img/land/' + this.level.land + '/land_' + this.level.land + (i <= 9 ? '0' : '') + i + '.png');
        }

        var tile_objects = [
            "barrel_blue",
            "barrel_blue_down",
            "barrel_red",
            "barrel_red_down",
            "barrier_red",
            "barrier_white",
            "cone_down",
            "cone_straight",
            "oil",
            "rock1",
            "rock2",
            "rock3",
            "tree_large",
            "tree_small"
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

                        objectContainer.addChild(objectTile);
                    }
                }

                objectContainer.position.x = self.level.tile_height * object.x;
                objectContainer.position.y = self.level.tile_width * object.y;

                self.stage.addChild(objectContainer);
            }
        });

        this.createCars();

        PIXI.loader.on('complete', function() {
            self.frame();
        });
    },

    frame: function() {
        var self = this;

        var currentTime = Date.now();
        var deltaTime = currentTime - this.previousTime;

        if (deltaTime > 0) {
            if (deltaTime > 100) {
                this.previousTime += deltaTime - 100;
                deltaTime = 100;
            }

            for (var i = 0; i < this.cars.length; ++i) {
                this.cars[i].doPhysics(deltaTime / 1000);
            }

            this.previousTime = currentTime;
        }

        /*for (var i = 0; i < self.cars.length; ++i) {
            var currentTime = Date.now();
            var deltaTime = currentTime - (self.cars[i].previousTime || Date.now());

            self.cars[i].doPhysics(deltaTime / 1000);
            self.cars[i].previousTime = currentTime;
        }*/

        this.renderer.render(self.stage);

        requestAnimationFrame(function() {
            self.frame();
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
            //for (var i = 0; i < Connections.connections.length; ++i) {
                var sprite = new PIXI.Sprite(resources['car_' + colors[0]].texture);
                var position = new Victor(100, 100);

                var car = new Car(sprite, position);

                self.stage.addChild(sprite);
                self.cars.push(car);
            //}
        });}

    /*
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

                car.position.x = i * 70;

                car.scale.x = .5;
                car.scale.y = .5;

                car.anchor.x = 0.5;
                car.anchor.y = 0.5;

                car.rotation = 90;

                self.stage.addChild(car);
            }
        });
    }
    */
};
