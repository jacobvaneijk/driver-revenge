/**
 * Module dependencies
 */

var favicon = require('serve-favicon');
var nunjucks = require('nunjucks');
var express = require('express');
var http = require('http');

/**
 * Routing
 */

var routes = require('./src/js/server/routes')(express.Router());

/**
 * Configure application
 */

var app = express();
var server = http.Server(app);

nunjucks.configure('src/views', {
    autoescape: true,
    express: app
});

app.set('port', process.env.PORT || 3000);
app.use(favicon(__dirname + '/public/favicon.png'));
app.use(express.static(__dirname + '/public'));
app.use('/', routes);

/**
 * Socket.io
 */

require('./src/js/server/socket')(server);

/**
 * Start the server.
 */

server.listen(app.get('port'), function() {
    console.log('Listening on port ' + app.get('port') + '.');
});
