var room = function (socket, key) {
    this.MAX_PLAYERS = 6;

    this.players = [];
    this.socket = socket;
    this.key = key;
}

module.exports = room;
