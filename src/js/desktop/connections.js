module.exports = {
    connections: [],
    maxPlayers: 0,

    init: function(maxPlayers) {
        this.maxPlayers = maxPlayers;

        this.drawConnections();
    },

    addConnection: function(index, name) {
        this.connections[index - 1] = name;

        this.drawConnections();
    },

    removeConnection: function(index) {
        this.connections.splice(index, 1);

        this.drawConnections();
    },

    drawConnections: function() {
        $('.js-connections').empty();

        var emptyConnections = this.maxPlayers - this.connections.length;

        for (var i = 0; i < this.connections.length; ++i) {
            $('.js-connections').append('<li class="step__connection step__connection--active" data-name="' + this.connections[i] + '"></li>');
        }

        for (var i = 0; i < emptyConnections; ++i) {
            $('.js-connections').append('<li class="step__connection"></li>');
        }
    }
};
