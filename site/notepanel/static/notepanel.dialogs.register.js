
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.register = function (me) {

    me.container = '#div_register';

    me.enable = function () {
        // reset form
        $('#div_register :input[type=text]').val('');
        $('#div_register :input[type=password]').val('');
        // event
        $('#a_register').on('click.notepanel', onRegister);
    };

    me.disable = function () {
        $('#a_register').off('.notepanel');
        $('#div_register_result').empty();
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
                notepanel.viewManager.closeDialog(me);
            })
            .fail(notepanel.ajaxErrorHandler);
        return false;
    };

    return me;
}(notepanel.dialogs.register || {});
