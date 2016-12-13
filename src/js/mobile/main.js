window.onload = function() {
    var socket = io();

    var roomKey = window.location.href.split('/')[3];

    socket.emit('new player', {
        key: roomKey
    });

    socket.on('room destroyed', function() {
        console.log('The room you joined was destroyed.');
    });
};
