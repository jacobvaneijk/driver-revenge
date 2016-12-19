var Game = function(key, socket) {
    this.players = [];
    this.socket = socket;
    this.key = key;
};

Object.defineProperty(Game, 'MAX_PLAYERS', {
    value: 5,
});

Game.prototype.addPlayer = function(player) {
    this.players.push(player);
};

Game.prototype.broadcast = function(message, data) {
    for (var i = 0; i < this.players.length; ++i) {
        this.players[i].socket.emit(message, data || null);
    }
};

Game.prototype.start = function() {
    // Do game logic here.
};

module.exports = Game;
