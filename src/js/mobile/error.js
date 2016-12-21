module.exports = {
    displayError: function(message) {
        $('.js-form, .js-waiting, .js-controller').hide();
        $('.js-error-page').css('display', 'flex');
        $('.js-error-description').text(message);
    }
};
