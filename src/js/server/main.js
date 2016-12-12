var room = require('./model/room');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var rooms = [];
