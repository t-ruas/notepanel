
notepanel.views.newboard = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_new_board').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            notepanel.views.mainmenu.disactivate();
            notepanel.views.menu.disactivate();
            notepanel.views.panel.lock();
            $('#a_create_board').on('click', onCreateBoard);
            $('#s_new_board_close').on('click', onClose);
            $('#div_new_board').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            notepanel.views.mainmenu.activate();
            notepanel.views.menu.activate();
            notepanel.views.panel.unlock();
            $('#a_create_board').off('click');
            $('#s_new_board_close').off('click');
            $('#div_new_board').hide();
            enabled = false;
        }
    };

    var onCreateBoard = function (e) {
        if($('#i_create_board').val() != '') {
            var postData = new Object();
            postData["boardName"] = $('#i_create_board').val();
            postData["boardPrivacy"] = $('#sel_choose_board_type').val();
            $.ajax({type: 'POST',
                    url: 'board/add',
                    xhrFields: {withCredentials: true},
                    dataType: 'json',
                    data: postData
                })
                .done(function (data) {
                    $('#i_create_board').val(null);
                    notepanel.views.panel.setBoard(data.board, notepanel.enums.userGroups.OWNER);
                })
                .fail(notepanel.ajaxErrorHandler);
            me.disable();
        }
        return false;
    };
    
    var onClose = function (e) {
        me.disable();
    };
    
    return me;
}(notepanel.views.newboard || {});
