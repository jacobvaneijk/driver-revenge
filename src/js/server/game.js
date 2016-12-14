/**
 * Game
 *
 * @param {String} key - Unique identifier for the game.
 * @param {Object} socket - The socket object of the game.
 */
var Game = function(key, socket) {
    this.key = key;
    this.socket = socket;

    this.players = [];
};

/**
 * Define the maximum amount of players in a game.
 */
Object.defineProperty(Game, "MAX_PLAYERS", {
    value: 6
});

/**
 * Add a player to a game.
 *
 * @param {Object} player - The player to add.
 */
Game.prototype.addPlayer = function(player) {
    this.players.push(player);
};

/**
 * Broadcast a message (with optional data) to every player in a game.
 *
 * @param {String} message - The message.
 * @param {Object} data - The optional data.
 */
Game.prototype.broadcast = function(message, data) {
    for (var i = 0; i < this.players.length; ++i) {
        this.players[i].socket.emit(message, data || null);
    }
};

module.exports = Game;
