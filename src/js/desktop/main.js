var connections = require('./connections');
var $ = require('jquery');

$(window).ready(function () {
    var socket = io();

    // Generate a random game key, which acts as an identifier.
    var gameKey = Math.random().toString(36).substr(2, 5);
    var gameURL = location.host + '/' + gameKey;

    // Display the URL with the room identifier.
    $('.js-url').text(gameURL);

    // Inform the server we want to host a game.
    socket.emit('game', gameKey);

    // Display 6 empty dots.
    for (var i = 0; i < 6; ++i) {
        connections.add();
    }

    // A player joined; update the connection dots.
    socket.on('player-joined', function(index) {
        connections.add(index);
    });

    // A player left; update the connection dots.
    socket.on('player-left', function(index) {
        connections.remove(index);
    });
});
