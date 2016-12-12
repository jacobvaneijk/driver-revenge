var connections = require('./connections');
var $ = require('jquery');

$(window).ready(function () {
    var socket = io();

    var roomKey = Math.random().toString(36).substr(2, 5);
    var roomURL = location.host + '/' + roomKey;

    $('.js-url').text(roomURL);

    socket.emit('new room', {
        key: roomKey,
    });

    socket.on('user added', function(socketID, data) {
        console.log('New player: ' + socketID);
    });
});
