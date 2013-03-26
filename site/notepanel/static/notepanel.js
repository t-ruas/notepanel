
var notepanel = {
    user: null,
    views: {}
};

notepanel.ajaxErrorHandler = function (xhr) {
    notepanel.views.error.enable();
};

notepanel.identify = function () {
    notepanel.setUser();
    $.ajax({type: 'GET',
            url: '/users/identify',
            dataType: 'json'})
        .done(function (data) {
            notepanel.setUser(data);
        })
        .fail(function (xhr) {
            if (xhr.status === 403) {
            } else {
                notepanel.ajaxErrorHandler.apply(this, arguments);
            }
        });
};

notepanel.getUser = function () {
    return notepanel.user;
};

notepanel.setUser = function (user) {
    notepanel.user = user;
    if (user) {
        notepanel.menus.main.setOnline();
    } else {
        notepanel.menus.main.setOffline();
    }
};

notepanel.openidProviders = [
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
