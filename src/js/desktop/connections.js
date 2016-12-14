var $ = require('jquery');

module.exports = {
    remove: function(index) {
        $('.js-connection:nth-child(' + index + ')').removeClass('home__connection--active');
    },
    add: function(index) {
        if (index) {
            $('.js-connection:nth-child(' + index + ')').addClass('home__connection--active');
        } else {
            $('.js-connections').append('<li class="home__connection js-connection"></li>');
        }
    },
};
