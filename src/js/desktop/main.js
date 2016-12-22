var Connections = require('./connections');
var Game = require('./game');

$(window).ready(function () {
    var socket = io();

    // Generate a random game key, which acts as an identifier.
    var gameKey = Math.random().toString(36).substr(2, 5);
    var gameURL = location.host + '/' + gameKey;

    // Display the URL with the room identifier.
    $('.js-url').text(gameURL);

    // Inform the server we want to host a game.
    socket.emit('game', gameKey);

    // Display 5 empty dots.
    Connections.init(5);

    // A player joined; update the connection dots.
    socket.on('player-joined', function(index, name) {
        Connections.addConnection(index, name);
    });

    // A player left; update the connection dots.
    socket.on('player-left', function(index) {
        Connections.removeConnection(index);
    });

    $('.js-next').on('click', function(event) {
        event.preventDefault();

        // Inform the server we want to start the game.
        socket.emit('start-game');

        // Hide the home wrapper.
        $('.home__wrapper').hide();

        // Initialize the game.
        Game.init();

        // Load the level in the game and render it afterwards.
        socket.on('level', function(level) {
            Game.loadLevel(level);
        });
    });
});
