
notepanel.views.register = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_register').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_register').on('click.notepanel', onRegister);
            $('#div_register').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_register').off('.notepanel');
            $('#div_register').hide();
            $('#div_register_result').empty();
            enabled = false;
        }
    };

    var onRegister = function (e) {
        notepanel.views.wait.enable();
        $('#div_register_result').empty();
        var data = $('#div_register :input').serializeObject();
        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/users',
                dataType: 'json',
                data: JSON.stringify(data)})
            .done(function (data) {
                notepanel.user = data.user;
                me.disable();
                notepanel.views.panel.enable();
            })
            .fail(notepanel.ajaxErrorHandler);
        return false;
    };

    return me;
}(notepanel.views.register || {});
