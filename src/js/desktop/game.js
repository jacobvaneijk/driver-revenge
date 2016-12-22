var Connections = require('./connections');

module.exports = {
    renderer: null,
    socket: null,
    stage: null,

    init: function(socket) {
        this.socket = socket;

        this.renderer = new PIXI.autoDetectRenderer(800, 600, {backgroundColor: 0xAA0000});
        this.stage = new PIXI.Container();

        $('body').append(this.renderer.view);
    },

    loadLevel: function(level) {
        var self = this;

        var width = Math.floor($('body').innerWidth() / level.tile_width) * level.tile_width;
        var height = Math.floor($('body').innerHeight() / level.tile_height) * level.tile_height;

        this.renderer.autoResize = true;
        this.renderer.resize(width, height);

        PIXI.loader.add('background', level.background).load(function (loader, resources) {
            var background = new PIXI.extras.TilingSprite(resources.background.texture, self.renderer.width, self.renderer.height);

            self.stage.addChild(background);
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
};
