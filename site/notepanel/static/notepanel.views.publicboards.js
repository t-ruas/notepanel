
notepanel.views.publicboards = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_public_boards').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            notepanel.views.mainmenu.disactivate();
            notepanel.views.menu.disactivate();
            notepanel.views.panel.lock();
            loadPublicBoards();
            $('#div_public_boards #s_close').on('click', onClose);
            $('#div_public_boards').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            notepanel.views.mainmenu.activate();
            notepanel.views.menu.activate();
            notepanel.views.panel.unlock();
            $('#a_choose_board').off('click');
            $('#a_refresh_boards').off('click');
            $('#sel_choose_board').off('change');
            $('#div_public_boards #s_close').off('click');
            $('#div_public_boards').hide();
            enabled = false;
        }
    };

    var onRefreshBoards = function (e) {
        me.refreshBoards();
        return false;
    };

    var loadPublicBoards = function() {
        loadBoardList("ph_public_board_list", "/board/public", "public_boards");
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
                $('#'+ placeHolder + ' li').on('click', onpublicboards);
            })
            .fail(notepanel.ajaxErrorHandler);
    }
    
    var onpublicboards = function (e) {
        //notepanel.views.wait.enable();
        $.ajax({type: 'GET',
                url: '/board/' + this.id,
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
    
    var onClose = function (e) {
        me.disable();
    };
    
    return me;
}(notepanel.views.publicboards || {});
