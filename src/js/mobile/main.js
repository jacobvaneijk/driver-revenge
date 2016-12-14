var $ = require('jquery');

$(window).ready(function() {
    var socket = io();

    // Extract the game identifier from the URL.
    var gameKey = window.location.href.split('/')[3];

    $('.js-save').on('click', function(event) {
        event.preventDefault();

        // Inform the server we want to join a game.
        socket.emit('player', {
            key: gameKey,
            name: $('.js-name').val()
        });
    });

    // Display a message of the game we want to join doesn't exist.
    socket.on('game-does-not-exist', function() {
        console.log('The game you intended to join doesn\'t exist.');
    });

    // Display a message of there is no more room in the game.
    socket.on('no-more-room', function() {
        console.log('The game you want to join doesn\'t has any places left.');
    });

    // Display a message if the game is destroyed.
    socket.on('game-destroyed', function() {
        console.log('The game you participated in doesn\'t exist anymore.');
    });
});
