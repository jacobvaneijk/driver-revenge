var Game = function(key, socket) {
    this.key = key;
    this.socket = socket;

    this.players = [];
};

Object.defineProperty(Game, "MAX_PLAYERS", {
    value: 6
});

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
};

Game.prototype.broadcast = function(message, data) {
    for (var i = 0; i < this.players.length; ++i) {
        this.players[i].socket.emit(message, data || null);
    }
};

module.exports = Game;
