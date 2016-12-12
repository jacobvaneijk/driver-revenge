var room = require('./src/js/server/model/room');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/:key([a-zA-Z0-9]{5})', function(req, res) {
    var key = req.params.key;

    res.sendFile(__dirname + '/public/mobile.html');
});

var connection = io.on('connection', function(socket) {

    socket.on('new room', function(data) {
        rooms.push(new room(socket, data.key));

        console.log('New room: ' + data.key + '!');
    });

    socket.on('new player', function(data) {
        var roomIndex = null;

        // Check if the requested room exists.
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].key == data.key) {
                roomIndex = i;
            }
        }

        // Add a new user to the requested room (if it exists).
        if (room !== null) {
            socket.roomIndex = roomIndex;

            rooms[roomIndex].players.push(socket);
            rooms[roomIndex].socket.emit('user added', socket.id, data);

            console.log('New player: ' + socket.id + '!');
        } else {
            console.log('The requested room doesn\'t exist.');
        }
    });

});

http.listen(3000, function() {
    console.log('Listening on port 3000.');
});
