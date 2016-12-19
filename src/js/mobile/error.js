var $ = require('jquery');

module.exports = {
    displayError: function(message) {
        $('.js-form, .js-waiting').hide();
        $('.js-error-page').css('display', 'flex');
        $('.js-error-description').text(message);
    }
};
