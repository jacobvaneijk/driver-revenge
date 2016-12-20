var $ = require('jquery');

module.exports = {
    display: function() {
        // Show the controller.
        $('.js-waiting').hide();
        $('.js-controller').show();
    }
};
