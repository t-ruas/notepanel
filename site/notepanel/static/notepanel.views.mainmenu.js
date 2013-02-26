
notepanel.views.mainmenu = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_main_menu').hide();
    });

    me.activate = function () {
        $(window).on('mousemove.notepanel', onWindowMouseMove);
    };

    me.disactivate = function () {
        $(window).off('mousemove.notepanel');
        $('#div_main_menu').hide();
    };

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_menu_logout').on('click', onLogout);
            $('#a_menu_new_board').on('click', onNewBoard);
            $('#a_menu_choose_board').on('click', onChooseBoard);
            $('#a_menu_import_board').on('click', onImportBoard);
            $('#div_main_menu').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_logout').off('click');
            $('#a_new_board').off('click');
            $('#a_menu_choose_board').off('click');
            $('#a_menu_import_board').off('click');
            $('#div_main_menu').hide();
            enabled = false;
        }
    };

    var onWindowMouseMove = function (e) {
        if (e.clientY < 10) {
            me.enable();
        } else if (e.clientY > $('#div_main_menu').height()) {
            me.disable();
        }
    }

    var onLogout = function (e) {
        // logout from board server
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/users/logout',
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {
                notepanel.reset();
            })
            .fail(notepanel.ajaxErrorHandler);
        // logout from website
        $.ajax({type: 'GET',
                url: '/logout',
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {});
        return false;
    };

    var onNewBoard = function (e) {
        notepanel.views.newboard.enable();
        return false;
    };
    
    var onChooseBoard = function (e) {
        notepanel.views.chooseboard.enable();
        return false;
    };
    
    var onImportBoard = function (e) {
        notepanel.views.importboard.enable();
        return false;
    };
    
    return me;
}(notepanel.views.mainmenu || {});
