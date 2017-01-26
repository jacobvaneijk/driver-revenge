var Controller = require('./controller.js');
var SetName = require('./setname.js');
var Error = require('./error.js');

$(window).ready(function() {
    var periods = 0;
    var socket = io();

    $('.js-enter').on('click', function(event) {
        event.preventDefault();

        var gameKey = $('.js-code').val();

        // Inform the server we want to join a game.
        socket.emit('player', gameKey);

        // Server tells which player we are.
        socket.on('player-number', function(number) {
            $('.js-player').html('Player ' + number);

            var carColors = ['black', 'blue', 'green', 'red', 'yellow'];

            $('.js-car').attr('src', '/img/cars/car_' + carColors[number - 1] + '.png');

            // Show the waiting screen.
            $('.js-form').hide();
            $('.js-waiting').css('display', 'block');

            setInterval(function() {
                if (++periods === 4) {
                    periods = 0;
                }

                $('.js-periods').text('.'.repeat(periods));
            }, 500);
        });
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
        Controller.init(socket);
        Controller.display();
    });
});
