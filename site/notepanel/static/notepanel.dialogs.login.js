
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.login = function (me) {

    me.open = function (callback) {
        callback(notepanel.template.templates.loadDialogLogin());
        $('#a_login').on('click', onLogin);
        $('#a_to_register').on('click', onToRegister);
    };

    var onLogin = function (e) {
        notepanel.views.wait.enable();
        $('#div_login_result').empty();
        // log in to board server
        var data = $('#div_login :input').serialize();
        console.log(data);
        $.ajax({type: 'POST',
                url: '/users/login',
                dataType: 'json',
                data: data})
            .done(function (data) {
                notepanel.setUser(data);
                notepanel.windowManager.closeDialog(me);
            })
            .fail(function (xhr) {
                if (xhr.status === 403) {
                    $('#div_login_result').text('Wrong user name/password.');
                } else {
                    notepanel.ajaxErrorHandler.apply(this, arguments);
                }
            })
            .always(function () {
                notepanel.views.wait.disable();
            });
        return false;
    };

    var onToRegister = function (e) {
        notepanel.viewManager.openDialog(notepanel.dialogs.register);
        return false;
    };

    return me;
}(notepanel.dialogs.login || {});
