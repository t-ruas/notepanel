
notepanel.views.mainmenu = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_main_menu').hide();
    });

    me.activate = function () {
        $(window).on('mousemove.mainmenu', onWindowMouseMove);
    };

    me.disactivate = function () {
        $(window).off('mousemove.mainmenu');
        $('#div_main_menu').hide();
    };

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_menu_logout').on('click', onLogout);
            $('#a_menu_my_boards').on('click', onMyBoards);
            $('#a_menu_public_boards').on('click', onPublicBoards);
            $('#a_menu_import_board').on('click', onImportBoard);
            $('#div_main_menu').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_logout').off('click');
            $('#a_menu_my_boards').off('click');
            $('#a_menu_public_boards').off('click');
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
        $.ajax({type: 'GET',
                url: '/users/logout',
                dataType: 'json'})
            .done(function (data) {
                notepanel.reset();
            })
            .fail(notepanel.ajaxErrorHandler);
            notepanel.views.panel.reset();
        return false;
    };

    var onMyBoards = function (e) {
        notepanel.views.myboards.enable();
        return false;
    };
    
    var onPublicBoards = function (e) {
        notepanel.views.publicboards.enable();
        return false;
    };
    
    var onImportBoard = function (e) {
        notepanel.views.importboard.enable();
        return false;
    };
    
    return me;
}(notepanel.views.mainmenu || {});
