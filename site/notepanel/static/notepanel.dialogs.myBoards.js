
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.myBoards = function (me) {

    me.open = function (callback) {
        $.ajax({type: 'GET',
                url: '/board/user',
                dataType: 'json'})
            .done(function (data) {
                if (data.boards.length) {
                    var list = {
                        id: 'private_boards',
                        boards: data.boards
                    };
                    callback(notepanel.template.templates.loadDialogMyBoards(list));
                    $('li').on('click', onChooseBoard);
                } else {
                    callback(notepanel.template.templates.loadDialogMyBoards());
                }
                $('#a_new_board').on('click', onNewBoard);
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    var onRefreshBoards = function (e) {
        me.refreshBoards();
        return false;
    };

    var onChooseBoard = function (e) {
        //notepanel.views.wait.enable();
        $.ajax({type: 'GET',
                url: '/board/' + $(this).attr('value'),
                dataType: 'json'})
            .done(function (data) {
                notepanel.views.panel.setBoard(data.board, data.user_group);
                notepanel.menus.board.setBoardUsers(data.boardUsers);
                notepanel.menus.board.setBoardName(data.board.name);
                notepanel.menus.board.locked = false;
                notepanel.windowManager.closeDialog(me);
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    var onNewBoard = function (e) {
        notepanel.windowManager.openDialog(notepanel.dialogs.newboard);
    };
    
    return me;
}(notepanel.dialogs.myBoards || {});
