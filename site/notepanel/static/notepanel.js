
var notepanel = {
    user: null,
    views: {}
};

notepanel.ajaxErrorHandler = function (xhr) {
    notepanel.views.error.enable();
};

notepanel.reset = function () {
    notepanel.user = null;
    notepanel.views.wait.enable();
    $.ajax({type: 'GET',
            url: '/users/identify',
            dataType: 'json'})
        .done(function (data) {
            notepanel.setUser(data);
            notepanel.views.panel.enable();
        })
        .fail(function (xhr) {
            if (xhr.status === 403) {
                notepanel.views.login.enable();
            } else {
                notepanel.ajaxErrorHandler.apply(this, arguments);
            }
        })
        .always(function () {
            notepanel.views.wait.disable();
        });
};

notepanel.setUser = function (user) {
    notepanel.user = user;
};
