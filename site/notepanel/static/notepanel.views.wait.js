
notepanel.views.wait = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_wait').hide();
    });
    
    // Disable this view
    me.disable = function () {
        if (!enabled) {
            $('#div_wait').stop(true, false).fadeOut(50);
            enabled = true;
        }
    };

    // Enable this view
    me.enable = function () {
        if (enabled) {
            $('#div_wait').stop(true, false).fadeIn(200);
            enabled = false;
        }
    };

    return me;
}(notepanel.views.wait || {});
