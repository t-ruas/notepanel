
notepanel.ajaxErrorHandler = function (xhr) {
    notepanel.views.error.enable();
};

notepanel.reset = function () {

    notepanel.user = null;

    // Disable all the views
    notepanel.views.login.disable();
    notepanel.views.register.disable();
    notepanel.views.panel.disable();
    notepanel.views.error.disable();
    notepanel.views.menu.disable();

    $.ajax({type: 'GET',
            url: notepanel.servicesUrl + '/users/identify',
            dataType: 'json'})
        .done(function (data) {
            notepanel.user = data.user;
            notepanel.views.panel.setBoard(data.boards[0]);
            notepanel.views.panel.enable();
        })
        .fail(function (xhr) {
            if (xhr.status === 403) {
                notepanel.views.login.enable();
            } else {
                notepanel.ajaxErrorHandler.apply(this, arguments);
            }
        });
};

$(document).ready(function () {
    notepanel.reset();
});
