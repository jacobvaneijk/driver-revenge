var PNGReader = require('png.js');
var path = require('path');
var fs = require('fs');

var util = require('./util');

module.exports = function(server) {
    var io = require('socket.io')(server);

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

            console.log('[Game ' + key + '] Game created.');
        });

        /**
         * A new client connected, which wants to attend to a game as a player.
         */
        socket.on('player', function(key) {
            var player = new Player('', socket);

            // Find the game the user wants to join.
            var gameIndex = null;

            for (var i = 0; i < games.length; ++i) {
                if (games[i].key === key) {
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
            games[gameIndex].socket.emit('player-joined', games[gameIndex].players.length, 'Player ' + games[gameIndex].players.length);

            // Emit the player's number.
            player.socket.emit('player-number', games[gameIndex].players.length);

            console.log('[Player ' + (games[gameIndex].players.length) + '] Joined game "' + games[gameIndex].key + '".');
        });

        /**
         * A host informs it wants to start the game.
         */
        socket.on('start-game', function() {
            var gameIndex = util.findGame(games, socket.id);
            var levelName = 'racetrack';
            var levelPath = path.resolve(__dirname + '/../../../levels/' + levelName + '.png');

            // Read the level file.
            fs.readFile(levelPath, function(error, data) {
                if (error) {
                    return console.error(error);
                }

                // Give the game the level to load.
                var reader = new PNGReader(data);

                reader.parse(function(error, data) {
                    var levelData = [];

                    for (var x = 0; x < data.getWidth(); ++x) {
                        for (var y = 0; y < data.getHeight(); ++y) {
                            levelData.push(data.getPixel(x, y));
                        }
                    }

                    games[gameIndex].socket.emit('level', {
                        data: levelData,
                        width: data.getWidth(),
                        height: data.getHeight()
                    });
                });

                // Inform every player that the game has begon..
                games[gameIndex].broadcast('game-started');

                // Start the game on the server side.
                games[gameIndex].start();
            });

            console.log('[Game ' + games[gameIndex].key + '] Has started the game.')
        });

        /**
         * A player started accelerating.
         */
        socket.on('accelerate', function() {
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

            games[socket.gameIndex].socket.emit('throttle down', playerIndex);
        });

        /**
         * A player stopped accelerating.
         */
        socket.on('stop-accelerate', function() {
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

            games[socket.gameIndex].socket.emit('throttle up', playerIndex);
        });

        /**
         * A player fires a bullet.
         */
        socket.on('shoot', function() {
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

            console.log('[Player ' + games[socket.gameIndex].players[playerIndex].name + '] Fires a bullet.');
        });

        /**
         * A player sent gyro data.
         */
        socket.on('gyro', function(data) {
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

            games[socket.gameIndex].socket.emit('steer', {
                value: data,
                player: playerIndex
            });
        });

        /**
         * A client has just disconnected and we need to handle that.
         */
        socket.on('disconnect', function() {
            if (socket.type === 'game') {
                var gameIndex = util.findGame(games, socket.id);

                console.log('[Game ' + games[gameIndex].key + '] Disconnected.');

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

                if (typeof games[socket.gameIndex].players[playerIndex] === 'undefined') {
                    return;
                }

                console.log('[Player ' + games[socket.gameIndex].players[playerIndex].name + '] Disconnected from game "' + games[socket.gameIndex].key + '".');

                // Inform the game the player left.
                games[socket.gameIndex].socket.emit('player-left', playerIndex);

                // Get rid of the player.
                games[socket.gameIndex].players.splice(playerIndex, 1);
            } else {
                console.log('[!] An unknown event happened.');
            }
        });

    });
};
