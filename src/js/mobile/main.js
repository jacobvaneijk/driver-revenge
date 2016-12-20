var Controller = require('./controller.js');
var SetName = require('./setname.js');
var Error = require('./error.js');
var $ = require('jquery');

$(window).ready(function() {
    var socket = io();

    // Extract the game identifier from the URL.
    var gameKey = window.location.href.split('/')[3];

    // Check the game conditions with the server.
    socket.emit('check-game-conditions', gameKey);

    $('.js-save').on('click', function(event) {
        event.preventDefault();

        // Save the name.
        SetName.saveName(socket, gameKey);
    });

    // Display a message if the game we want to join doesn't exist.
    socket.on('game-does-not-exist', function() {
        Error.displayError('The game you intended to join does not exist.');
    });

    // Display a message if there is no more room in the game.
    socket.on('no-more-room', function() {
        Error.displayError('The game you want to join does not have any places left.');
    });

    // Display a message if the game is destroyed.
    socket.on('game-destroyed', function() {
        Error.displayError('The game you participated in does not exist anymore.');
    });

    // Display the controller if the game is started.
    socket.on('game-started', function() {
        Controller.display();
    });
});
