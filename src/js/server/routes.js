var path = require('path');

module.exports = function(app) {

    /**
     * Homepage
     */
    app.get('/', function(req, res) {
        res.sendFile(path.join(__dirname + '/../../../public/index.html'));
    });

    /**
     * This is the route for mobile devices which want to connect to a room.
     */
    app.get('/:key([a-zA-Z0-9]{5})', function(req, res) {
        var key = req.params.key;

        res.sendFile(path.join(__dirname + '/../../../public/mobile.html'));
    });

}
