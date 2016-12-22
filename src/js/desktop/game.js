var Connections = require('./connections');

module.exports = {
    renderer: null,
    stage: null,
    socket: null,

    init: function(socket) {
        console.log('Initializing the game...');

        var self = this;

        this.renderer = new PIXI.autoDetectRenderer(640, 480);
        this.stage = new PIXI.Container();
        this.socket = socket;

        $('body').append(this.renderer.view);

        this.renderer.autoresize = true;
    },

    loadLevel: function(level) {
        console.log('Parsing the level data...');

        this.renderer.backgroundColor = parseInt(level.background_color, 16);
        this.renderer.autoResize = true;

        var width = Math.floor($('body').innerWidth() / level.tile_width) * level.tile_width;
        var height = Math.floor($('body').innerHeight() / level.tile_height) * level.tile_height;

        this.renderer.resize(width, height);

        this.spawnCars();
    },

    spawnCars: function() {
        console.log('Spawning cars on the level...');
    },

    render: function() {
        console.log('Rendering the game...');

        this.renderer.render(this.stage);
    }
};
