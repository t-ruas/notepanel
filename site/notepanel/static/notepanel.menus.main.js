
notepanel.menus = notepanel.menus || {};

notepanel.menus.main = function (me) {

    me.hide = true;
    me.position = notepanel.windowManager.menuPositions.TOP;
    me.container = '#div_main_menu';

    me.enable = function () {
        $('#a_menu_logout').on('click', onLogout);
        $('#a_menu_login').on('click', onLogin);
        $('#a_menu_my_boards').on('click', onMyBoards);
        $('#a_menu_public_boards').on('click', onPublicBoards);
        $('#a_menu_import_board').on('click', onImportBoard);
    };

    me.disable = function () {
        $('#a_menu_logout').off('click');
        $('#a_menu_login').off('click');
        $('#a_menu_my_boards').off('click');
        $('#a_menu_public_boards').off('click');
        $('#a_menu_import_board').off('click');
    };

    me.setOnline = function () {
        $('#a_menu_logout').show();
        $('#a_menu_login').hide();
    };

    me.setOffline = function () {
        $('#a_menu_logout').hide();
        $('#a_menu_login').show();
    };

    var onLogin = function (e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.windowManager.openDialog(notepanel.dialogs.login);
    };

    var onLogout = function (e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.menus.board.locked = true;
        notepanel.views.panel.setBoard();
        $.ajax({type: 'GET',
                url: '/users/logout',
                dataType: 'json'})
            .fail(notepanel.ajaxErrorHandler)
            .always(function () {
                notepanel.setUser();
            });
        return false;
    };

    var onMyBoards = function (e) {
        notepanel.windowManager.hideMenu(me);
        if (notepanel.getUser()) {
            notepanel.windowManager.openDialog(notepanel.dialogs.myBoards);
        } else {
            notepanel.windowManager.openDialog(notepanel.dialogs.login);
        }
        return false;
    };

    var onPublicBoards = function (e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.windowManager.openDialog(notepanel.dialogs.publicBoards);
        return false;
    };

    var onImportBoard = function (e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.windowManager.openDialog(notepanel.dialogs.importBoard);
        return false;
    };

    return me;
}(notepanel.menus.main || {});
