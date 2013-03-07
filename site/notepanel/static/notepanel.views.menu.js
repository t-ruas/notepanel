
notepanel.views.menu = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_menu').hide();
        var $templates = $('#ul_node_templates');
        for (var n in notepanel.notes.designers) {
            (function (n) {
                $templates.append(
                    $('<li>').append(
                        $('<a href="#">' + notepanel.notes.designers[n].title + '</a>')
                            .on('click', function (e) {
                                notepanel.views.panel.addNote(n);
                                me.disable();
                                return false;
                            })
                    )
                );
            })(n);
        }
    });

    me.activate = function () {
        $(window).on('mousemove.menu', onWindowMouseMove);
    };

    me.disactivate = function () {
        $(window).off('mousemove.menu');
    };

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_invite_user').on('click', onInviteUser);
            $('#a_export_board').on('click', onExportBoard);
            $('#a_delete_board').on('click', onDeleteBoard);
            $('#a_close_board').on('click', onCloseBoard);
            $('#div_menu').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_invite_user').off('click');
            $('#a_export_board').off('click');
            $('#a_delete_board').off('click');
            $('#a_close_board').off('click');
            $('#div_menu').hide();
            enabled = false;
        }
    };

    var onWindowMouseMove = function (e) {
        if (e.clientX > window.innerWidth - 10) {
            me.enable();
        } else if (e.clientX < window.innerWidth - 10 - $('#div_menu').width()) {
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
        return false;
    };

    var onInviteUser = function(e) {
        var boardId = $('#sel_choose_board').val();
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
        me.disable();
        var boardId = notepanel.views.panel.getBoardId();
        if (boardId) {
            $.ajax({type: 'DELETE',
                    url: '/boards/' + boardId,
                    dataType: 'json'})
                .done(function (data) {
                    notepanel.views.panel.setBoard();
                    notepanel.views.menu.disactivate();
                })
                .fail(notepanel.ajaxErrorHandler);
        } else {
            // Shouldn't be here.
            notepanel.views.panel.setBoard();
            notepanel.views.menu.disactivate();
        }
        return false;
    };

    var onCloseBoard = function(e) {
        me.disable();
        notepanel.views.panel.setBoard();
        notepanel.views.menu.disactivate();
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

    return me;
}(notepanel.views.menu || {});
