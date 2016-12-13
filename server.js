var favicon = require('serve-favicon');
var nunjucks = require('nunjucks');
var express = require('express');
var http = require('http');

/**
 * Configure application.
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
