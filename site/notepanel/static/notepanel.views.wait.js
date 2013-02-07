
notepanel.views.wait = function (me) {

    // Disable this view
    me.disable = function () {
        $('#div_wait').hide();
    };

    // Enable this view
    me.enable = function () {
        $('#div_wait').show();
    };

    return me;
}(notepanel.views.wait || {});
