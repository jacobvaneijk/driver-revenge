var $ = require('jquery');

$(window).ready(function() {
    var periods = 0;
    var socket = io();

    // Extract the game identifier from the URL.
    var gameKey = window.location.href.split('/')[3];

    socket.emit('check-game-conditions', gameKey);

    $('.js-save').on('click', function(event) {
        event.preventDefault();

        // Inform the server we want to join a game.
        socket.emit('player', {
            key: gameKey,
            name: $('.js-name').val()
        });

        // Show the waiting screen.
        $('.js-form').hide();
        $('.js-waiting').css('display', 'flex');

        setInterval(function() {
            if (++periods === 4) {
                periods = 0;
            }

            $('.js-periods').text('.'.repeat(periods));
        }, 500);
    });

    // Display a message if the game we want to join doesn't exist.
    socket.on('game-does-not-exist', function() {
        console.log('The game you intended to join doesn\'t exist.');

        $('.js-form').hide();
        $('.js-error-page').css('display', 'flex');
        $('.js-error-description').text('The game you intended to join does not exist.');
    });

    // Display a message if there is no more room in the game.
    socket.on('no-more-room', function() {
        console.log('The game you want to join doesn\'t has any places left.');

        $('.js-form').hide();
        $('.js-error-page').css('display', 'flex');
        $('.js-error-description').text('The game you want to join does not have any places left.');
    });

    // Display a message if the game is destroyed.
    socket.on('game-destroyed', function() {
        console.log('The game you participated in doesn\'t exist anymore.');

        $('.js-form').hide();
        $('.js-error-page').css('display', 'flex');
        $('.js-error-description').text('The game you participated in does not exist anymore.');
    });
});
