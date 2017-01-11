module.exports = {
    saveName: function(socket, gameKey) {
        // Inform the server we want to join a game.
        socket.emit('player', {
            name: $('.js-name').val(),
            key: gameKey,
        });

        // Show the waiting screen.
        $('.js-form').hide();
        $('.js-waiting').css('display', 'flex');
    }
};
