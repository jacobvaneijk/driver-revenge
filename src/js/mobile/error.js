module.exports = {
    displayError: function(message) {
        $('.js-form, .js-waiting, .js-controller').hide();
        $('.js-error').show();
        $('.js-error-description').text(message);

        console.log(message);
    }
};
