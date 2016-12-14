var $ = require('jquery');

$(window).ready(function() {
    var socket = io();

    var roomKey = window.location.href.split('/')[3];

    socket.emit('new player', {
        key: roomKey
    });

    socket.on('room destroyed', function() {
        console.log('The room you joined was destroyed.');
    });

    $('.js-save').on('click', function(event) {
        event.preventDefault();

        socket.emit('change name player', $('.js-name').val());

        // todo: move to next view
    })
});
