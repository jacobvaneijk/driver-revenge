module.exports = function(router) {

    /**
     * This route sets up a new game.
     */
    router.get('/', function(req, res) {
        var ua = req.header('user-agent');

        if (/mobile/i.test(ua)) {
            res.render('mobile/index.html');
        } else {
            res.render('desktop/index.html');
        }
    });

    return router;

};
