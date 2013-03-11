
notepanel.menus = notepanel.menus || {};

notepanel.menus.main = function (me) {

    me.hide = true;
    me.position = notepanel.windowManager.menuPositions.TOP;
    me.container = '#div_main_menu';

    me.enable = function () {
        $('#a_menu_logout').on('click', onLogout);
        $('#a_menu_my_boards').on('click', onMyBoards);
        $('#a_menu_public_boards').on('click', onPublicBoards);
        $('#a_menu_import_board').on('click', onImportBoard);
    };
    
    me.disable = function () {
        $('#a_menu_logout').off('click');
        $('#a_menu_my_boards').off('click');
        $('#a_menu_public_boards').off('click');
        $('#a_menu_import_board').off('click');
    };
    
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
        notepanel.windowManager.hideMenu(me);
        notepanel.windowManager.openDialog(notepanel.dialogs.myBoards);
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
