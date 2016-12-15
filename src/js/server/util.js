module.exports = {

    /**
     * Find a game in a list of @games by @socketID.
     *
     * Returns the index of the game in @games when it's found, or `null` when
     * no game is found.
     */
    findGame: function(games, socketID) {
        for (var i = 0; i < games.length; ++i) {
            if (games[i].socket.id === socketID) {
                return i;
            }
        }

        return null;
    }

};
