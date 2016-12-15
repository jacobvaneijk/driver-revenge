module.exports = function(server) {

    var io = require('socket.io')(server);
    var util = require('./util');

    var Game = require('./game');
    var Player = require('./player');

    var games = [];

    io.on('connection', function(socket) {

        /**
         * A new client connected, which wants to host a game.
         */
        socket.on('game', function(key) {
            var game = new Game(key, socket);

            // Make sure we can later identify the socket (i.e. on disconnection).
            game.socket.type = 'game';

            // Add the newly created game to the list of games.
            games.push(game);

            console.log('(Game ' + key + '): Game created!');
        });

        /**
         * A new client connected, which wants to attend to a game as a player.
         */
        socket.on('player', function(data) {
            var player = new Player(data.name, socket);

            // Find the game the user wants to join.
            var gameIndex = null;
            for (var i = 0; i < games.length; ++i) {
                if (games[i].key == data.key) {
                    gameIndex = i;
                }
            }

            // Check if the game exists.
            if (gameIndex === null) {
                socket.emit('game-does-not-exist');

                return;
            }

            // Check if there is room for the player in the game.
            if (games[gameIndex].players.length >= Game.MAX_PLAYERS) {
                socket.emit('no-more-room');

                return;
            }

            // Make sure we can later identify the socket (i.e. on disconnection).
            player.socket.type = 'player';
            player.socket.gameIndex = gameIndex;

            // Add the player to a game.
            games[gameIndex].addPlayer(player);

            // Inform the game a new player is added.
            games[gameIndex].socket.emit('player-joined', games[gameIndex].players.length);

            console.log('(Player ' + data.name + '): Joined ' + games[gameIndex].key + '!');
        });

        /**
         * A client has just disconnected and we need to handle that.
         */
        socket.on('disconnect', function() {
            if (socket.type === 'game') {
                var gameIndex = util.findGame(games, socket.id);

                console.log('(Game ' + games[gameIndex].key + '): Disconnected.');

                // Inform every player in the game that it doesn't exist anymore.
                games[gameIndex].broadcast('game-destroyed');

                // Get rid of the game.
                games.splice(gameIndex, 1);
            } else if (socket.type === 'player') {
                var playerIndex = null;

                // Check if the game still exists.
                if (typeof games[socket.gameIndex] === 'undefined') {
                    return;
                }

                // Find the player which disconnected.
                for (var i = 0; i < games[socket.gameIndex].players.length; ++i) {
                    if (games[socket.gameIndex].players[i].socket.id == socket.id) {
                        playerIndex = i;
                    }
                }

                console.log('(Player ' + games[socket.gameIndex].players[playerIndex].name + '): Disconnected.');

                // Inform the game the player left.
                games[socket.gameIndex].socket.emit('player-left', games[socket.gameIndex].players.length);

                // Get rid of the player.
                games[socket.gameIndex].players.splice(playerIndex, 1);
            } else {
                console.log('wtf?');
            }
        });

    });

};
