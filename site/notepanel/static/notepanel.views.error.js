
notepanel.views.error = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_fatal').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#div_fatal').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#div_fatal').hide();
            enabled = false;
        }
    };

    return me;
}(notepanel.views.error || {});
