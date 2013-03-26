
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.publicBoards = function (me) {

    me.open = function (callback) {
        $.ajax({type: 'GET',
                url: '/board/public',
                dataType: 'json'})
            .done(function (data) {
                if (data.boards.length) {
                    var list = {
                        id: 'public_boards',
                        boards: data.boards
                    };
                    callback(notepanel.template.templates.loadDialogPublicBoards(list));
                    $('li').on('click', onChooseBoard);
                } else {
                    callback(notepanel.template.templates.loadDialogPublicBoards());
                }
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    var onRefreshBoards = function (e) {
        me.refreshBoards();
        return false;
    };

    var onpublicboards = function (e) {
        //notepanel.views.wait.enable();
        $.ajax({type: 'GET',
                url: '/board/' + $(this).attr('value'),
                dataType: 'json'})
            .done(function (data) {
                notepanel.views.panel.setBoard(data.board, data.user_group);
                notepanel.template.templates.loadBoardUserList(data.boardUsers);
                notepanel.views.menu.activate();
                notepanel.views.menu.setBoardName(data.board.name);
                me.disable();
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    return me;
}(notepanel.dialogs.publicBoards || {});
