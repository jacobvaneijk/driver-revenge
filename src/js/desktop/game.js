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

        PIXI.loader.on('complete', function() {
            self.renderer.render(self.stage);
        });
    }
};
