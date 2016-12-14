/**
 * Player
 *
 * @param {String} name - The name of the player.
 * @param {Object} socket - The socket object of the player.
 */
var Player = function(name, socket) {
    this.name = name;
    this.socket = socket;
};

module.exports = Player;
