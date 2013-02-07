
notepanel.views.login = function (me) {

    // Disable this view
    me.disable = function () {

        // Remove event handlers
        $('#a_login').off('.notepanel');
        $('#a_to_register').off('.notepanel');

        $('#div_login').hide();
        $('#div_login_result').empty();
    };

    // Enable this view
    me.enable = function () {

        $('#div_login').show();

        $('#a_login').on('click.notepanel', function (e) {
            $('#div_login_result').empty();
            $.ajax({type: 'GET',
                    url: notepanel.servicesUrl + '/users/login?' + $('#div_login :input').serialize(),
                    dataType: 'json'})
                .done(function (data) {
                    notepanel.user = data.user;
                    notepanel.views.panel.setBoard(data.boards[0]);
                    me.disable();
                    notepanel.views.panel.enable();
                })
                .fail(function (xhr) {
                    if (xhr.status === 403) {
                        $('#div_login_result').text('Wrong user name/password.');
                    } else {
                        notepanel.ajaxErrorHandler.apply(this, arguments);
                    }
                });
            return false;
        });

        $('#a_to_register').on('click.notepanel', function (e) {
            me.disable();
            notepanel.views.register.enable();
            return false;
        });
    };

    return me;
}(notepanel.views.login || {});
