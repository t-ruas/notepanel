﻿
notepanel.views.myboards = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_my_boards').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            notepanel.views.mainmenu.disactivate();
            notepanel.views.menu.disactivate();
            notepanel.views.panel.lock();
            loadUserBoards();
            $('#a_new_board').on('click', onNewBoard);
            $('#div_my_boards #s_close').on('click', onClose);
            $('#div_my_boards').show();
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
            $('#div_my_boards #s_close').off('click');
            $('#div_my_boards').hide();
            enabled = false;
        }
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
                notepanel.views.menu.activate();
                notepanel.views.menu.setBoardName(data.board.name);
                me.disable();
            })
            .fail(notepanel.ajaxErrorHandler);
    };
    
    var onClose = function (e) {
        me.disable();
    };
    
    var onNewBoard = function (e) {
        me.disable();
        notepanel.views.newboard.enable();
    };
    
    return me;
}(notepanel.views.myboards || {});