
notepanel.views.login = function (me) {

    var openidProviders = [
        {
            name: 'google',
            url: window.encodeURIComponent('https://www.google.com/accounts/o8/id'),
            imageUrl: 'http://www.google.com/favicon.ico',
            imageTitle: 'Sigin with Google'
        },
        {
            name: 'yahoo',
            url: window.encodeURIComponent('https://yahoo.com/'),
            imageUrl: 'http://www.yahoo.com/favicon.ico',
            imageTitle: 'Sigin with Yahoo'
        }
    ];

    var enabled = false;

    $(document).ready(function () {
        $('#div_login').hide();
        notepanel.template.templates.loadOpenidProviders(openidProviders);
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            // reset form
            $('#i_username').val('');
            $('#i_password').val('');
            // events
            $('#a_login').on('click', onLogin);
            $('#a_to_register').on('click', onToRegister);
            $('#div_login #s_close').on('click', onClose);
            $('#div_login').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_login').off('click');
            $('#a_to_register').off('click');
            $('#div_login #s_close').off('click');
            $('#div_login').hide();
            $('#div_login_result').empty();
            enabled = false;
        }
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
                me.disable();
                notepanel.views.panel.enable();
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
        me.disable();
        notepanel.views.register.enable();
        return false;
    };
    
    var onClose = function (e) {
        me.disable();
    };
        
    return me;
}(notepanel.views.login || {});
