module.exports = {
    socket: null,

    init: function(socket) {
        this.socket = socket;
    },

    display: function() {
        // Show the controller.
        $('.js-waiting').hide();
        $('.js-controller').show();

        // Register the handlers.
        this.registerHandlers();
    },

    registerHandlers: function() {
        var self = this;

        $('.js-gas').on('tapstart', function(event) {
            self.socket.emit('accelerate');
        });

        $('.js-gas').on('tapend', function(event) {
            self.socket.emit('stop-accelerate');
        });

        $('.js-shoot').on('tap', function(event) {
            self.socket.emit('shoot');
        });

        window.ondevicemotion = function(event) {
            self.socket.emit('gyro', event.accelerationIncludingGravity.y);
        };
    }
};
