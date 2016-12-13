var express = require('express');
var http = require('http');

var app = express();
var server = http.Server(app);

/**
 * Express app configuration.
 */
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

/**
 * Routing
 */
require('./src/js/server/routes')(app);

/**
 * Socket.io
 */
require('./src/js/server/socket-io')(server);

server.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port') + '.');
});
