
notepanel.views.login = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_login').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_login').on('click', onLogin);
            $('#a_to_register').on('click', onToRegister);
            $('#div_login').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_login').off('click');
            $('#a_to_register').off('click');
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
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/users/login?' + data,
                xhrFields: {withCredentials: true},
                dataType: 'json'})
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
        // login to web site
        var postData = new Object();
        $("#div_login :input").each(function() {
            postData[$(this).attr("name")] = $(this).val();
        });
        $.ajax({type: 'POST',
                url: '/login',
                xhrFields: {withCredentials: true},
                dataType: 'json',
                data: postData})
            .done(function (data) {});
        return false;
    };

    var onToRegister = function (e) {
        me.disable();
        notepanel.views.register.enable();
        return false;
    };

    return me;
}(notepanel.views.login || {});
