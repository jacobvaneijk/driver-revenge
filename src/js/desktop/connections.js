var $ = require('jquery');

module.exports = {
    add: function (active) {
        $('.js-connections').append('<li class="home__connection' + (active ? ' home__connection--active' : '') + '"></li>');
    },
};
