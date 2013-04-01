
notepanel.menus = notepanel.menus || {};

notepanel.menus.board = function (me) {

    me.hide = true;
    me.position = notepanel.windowManager.menuPositions.RIGHT;
    me.container = '#div_menu';

    me.enable = function () {
        $('#a_invite_user').on('click', onInviteUser);
        $('#a_board_settings').on('click', onBoardSettings);
        $('#a_export_board').on('click', onExportBoard);
        $('#a_delete_board').on('click', onDeleteBoard);
        $('#a_close_board').on('click', onCloseBoard);
    };

    me.disable = function () {
        $('#a_invite_user').off('click');
        $('#a_board_settings').off('click');
        $('#a_export_board').off('click');
        $('#a_delete_board').off('click');
        $('#a_close_board').off('click');
    };

    $(document).ready(function () {
        var $templates = $('#ul_node_templates');
        for (var n in notepanel.notes.designers) {
            (function (n) {
                $templates.append(
                    $('<li>').append(
                        $('<a href="#">' + notepanel.notes.designers[n].title + '</a>')
                            .on('click', function (e) {
                                notepanel.views.panel.addNote(n);
                                notepanel.windowManager.hideMenu(me);
                                return false;
                            })
                    )
                );
            })(n);
        }
    });

    var onInviteUser = function(e) {
        var boardId = notepanel.views.panel.getBoardId();
        var userName = $('#i_invite_user').val();
        var userGroup = $('#sel_choose_user_group').val();
        if(userName.length>0) {
            $.ajax({type: 'GET',
                    url: '/board/' + boardId + '/users/add/' + userName + '/' + userGroup,
                    dataType: 'json'})
                .done(function (data) {
                    $('#i_invite_user').val('');
                    notepanel.template.templates.loadBoardUserList(data.boardUsers);
                })
                .fail(notepanel.ajaxErrorHandler);
        }
        return false;
    };

    var onDeleteBoard = function(e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.menus.board.locked = true;
        var boardId = notepanel.views.panel.getBoardId();
        if (boardId) {
            $.ajax({type: 'DELETE',
                    url: '/boards/' + boardId,
                    dataType: 'json'})
                .done(function (data) {
                    notepanel.views.panel.setBoard();
                })
                .fail(notepanel.ajaxErrorHandler);
        } else {
            // Shouldn't be here.
            notepanel.views.panel.setBoard();
        }
        return false;
    };

    var onCloseBoard = function(e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.menus.board.locked = true;
        notepanel.views.panel.setBoard();
        return false;
    };

    var onExportBoard = function(e) {
        var boardId = $('#sel_choose_board').val();
        if(boardId>0) {
            url = '/board/' + boardId + '/export';
            downloadURL(url);
        }
        return false;
    }

    var onBoardSettings = function(e) {
        notepanel.windowManager.hideMenu(me);
        notepanel.windowManager.openDialog(notepanel.dialogs.boardSettings);
    }

    var downloadURL = function downloadURL(url) {
        var hiddenIFrameID = 'hiddenDownloader',
            iframe = document.getElementById(hiddenIFrameID);
        if (iframe === null) {
            iframe = document.createElement('iframe');
            iframe.id = hiddenIFrameID;
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
        }
        iframe.src = url;
    };

    me.setBoardName = function (name) {
        $('#div_menu_board_name').html(name);
    };

    me.setBoardUsers = function (users) {
        $("#ph_board_user_list").html(notepanel.template.templates.loadBoardUserList(users));
    };

    return me;
}(notepanel.menus.board || {});
