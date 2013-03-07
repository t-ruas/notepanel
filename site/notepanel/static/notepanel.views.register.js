
notepanel.views.register = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_register').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_register').on('click.notepanel', onRegister);
            $('#div_register #s_close').on('click', onClose);
            $('#div_register').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_register').off('.notepanel');
            $('#div_register #s_close').off('click');
            $('#div_register').hide();
            $('#div_register_result').empty();
            enabled = false;
        }
    };

    var onRegister = function (e) {
        notepanel.views.wait.enable();
        $('#div_register_result').empty();
        var data = $('#div_register :input').serializeObject();
        $.ajax({type: 'PUT',
                url: '/users',
                dataType: 'json',
                data: JSON.stringify(data)})
            .done(function (data) {
                notepanel.setUser(data);
                me.disable();
                notepanel.views.panel.enable();
            })
            .fail(notepanel.ajaxErrorHandler);
        return false;
    };
    
    var onClose = function (e) {
        me.disable();
        notepanel.views.login.enable();
    };

    return me;
}(notepanel.views.register || {});
