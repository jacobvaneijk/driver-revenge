var room = function (socket, key) {
    this.players = [];
    this.socket = socket;
    this.key = key;
}

module.exports = room;
