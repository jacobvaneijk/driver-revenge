module.exports = {
    findGame: function(games, socketID) {
        for (var i = 0; i < games.length; ++i) {
            if (games[i].socket.id === socketID) {
                return i;
            }
        }

        return null;
    }
};
