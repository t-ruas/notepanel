
var notepanel = {
    user: null,
    views: {},
    servicesUrl: '{{services_url}}',
};

notepanel.ajaxErrorHandler = function (xhr) {
    notepanel.views.error.enable();
};

notepanel.reset = function () {

    

    notepanel.user = null;

    notepanel.views.wait.enable();

    $.ajax({type: 'GET',
            url: notepanel.servicesUrl + '/users/identify',
            xhrFields: {withCredentials: true},
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
