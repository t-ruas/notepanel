
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.myBoards = function (me) {

    me.container = '#div_my_boards';

    me.enable = function () {
        loadUserBoards();
        $('#a_new_board').on('click', onNewBoard);
        $('#div_my_boards #s_close').on('click', onClose);
    };

    me.disable = function () {
        $('#a_choose_board').off('click');
        $('#a_refresh_boards').off('click');
        $('#sel_choose_board').off('change');
        $('#div_my_boards #s_close').off('click');
    };

    var onRefreshBoards = function (e) {
        me.refreshBoards();
        return false;
    };

    var loadUserBoards = function() {
        loadBoardList("ph_private_board_list", "/board/user", "private_boards");
    }
    
    var loadBoardList = function(placeHolder, url, listId) {
        $.ajax({type: 'GET',
                url: url,
                dataType: 'json'})
            .done(function (data) {
                // check if data.boards.length > 0
                var list = {
                    id: listId,
                    boards: data.boards
                };
                notepanel.template.templates.loadBoardList(placeHolder, list);
                $('#'+ placeHolder + ' li').on('click', onChooseBoard);
            })
            .fail(notepanel.ajaxErrorHandler);
    }
    
    var onChooseBoard = function (e) {
        //notepanel.views.wait.enable();
        $.ajax({type: 'GET',
                url: '/board/' + this.id,
                dataType: 'json'})
            .done(function (data) {
                notepanel.views.panel.setBoard(data.board, data.user_group);
                notepanel.template.templates.loadBoardUserList(data.boardUsers);
                //notepanel.views.menu.activate();
                notepanel.menus.board.setBoardName(data.board.name);
                notepanel.menus.board.locked = false;
                notepanel.windowManager.closeDialog(me);
            })
            .fail(notepanel.ajaxErrorHandler);
    };
    
    var onClose = function (e) {
        notepanel.windowManager.closeDialog(me);
    };
    
    var onNewBoard = function (e) {
        notepanel.windowManager.openDialog(notepanel.dialogs.newboard);
    };
    
    return me;
}(notepanel.dialogs.myBoards || {});
