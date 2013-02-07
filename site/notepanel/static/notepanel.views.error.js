
notepanel.views.error = function (me) {

    // Disable this view
    me.disable = function () {
        $('#div_fatal').hide();
    };

    // Enable this view
    me.enable = function () {
        $('#div_fatal').show();
    };

    return me;
}(notepanel.views.error || {});
