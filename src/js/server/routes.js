module.exports = function(router) {

    /**
     * This route sets up a new game.
     */
    router.get('/', function(req, res) {
        res.render('desktop/index.html');
    });

    /**
     * Every player which wants to join a game will need to go through this
     * route.
     */
    router.get('/:key([a-zA-Z0-9]{5})', function(req, res) {
        res.render('mobile/index.html');
    });

    return router;

};
