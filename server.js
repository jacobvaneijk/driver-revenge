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

        // Try to find the room the user wants to join.
        for (var i = 0; i < rooms.length; i++) {
            if (rooms[i].key == data.key) {
                roomIndex = i;
            }
        }

        // Quit if no room is found.
        if (room === null) {
            console.log('The requested room doesn\'t exist.');

            return;
        }

        // Check if there is room to join.
        if (rooms[roomIndex].players.length >= rooms[roomIndex].MAX_PLAYERS) {
            console.log('No more room for players in this room.');

            return;
        }

        // Add the user to the requested room.
        {
            socket.roomIndex = roomIndex;

            rooms[roomIndex].players.push(socket);
            rooms[roomIndex].socket.emit('user added', socket.id, data);

            console.log('New player: ' + socket.id + '!');
        }
    });

    socket.on('disconnect', function(data) {
        // Check whether a room or a player disconnected.
        if (typeof socket.roomIndex == 'undefined') {
            var roomIndex = null;

            // Find the room which disconnected.
            for (var i = 0; i < rooms.length; i++) {
                if (rooms[i].socket.id == socket.id) {
                    roomIndex = i;
                }
            }

            // Inform every player in the room that it doesn't exist anymore.
            for (var i = 0; i < rooms[roomIndex].players.length; i++) {
                rooms[roomIndex].players[i].emit('room destroyed');
            }

            // Remove the room.
            rooms.splice(roomIndex, 1);
        } else {
            var playerIndex = null;

            // Find the player which disconnected.
            for (var i = 0; i < rooms[socket.roomIndex].players.length; i++) {
                if (rooms[socket.roomIndex].players[i].id == socket.id) {
                    playerIndex = i;
                }
            }

            // Remove the player.
            rooms[socket.roomIndex].players.splice(playerIndex, 1);
        }
    });
});

http.listen(3000, function() {
    console.log('Listening on port 3000.');
});
