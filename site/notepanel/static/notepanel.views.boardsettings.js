
notepanel.views.boardsettings = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_board_settings').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            notepanel.views.mainmenu.disactivate();
            notepanel.views.menu.disactivate();
            notepanel.views.panel.lock();
            var currentBoard = notepanel.views.panel.getBoard();
            loadBoardSettingsForm(currentBoard);
            // reset form
            
            // events
            $('#div_board_settings #s_close').on('click', onClose);
            $('#div_board_settings').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            notepanel.views.mainmenu.activate();
            notepanel.views.menu.activate();
            notepanel.views.panel.unlock();
            $('#div_board_settings #s_close').off('click');
            $('#div_board_settings').hide();
            enabled = false;
        }
    };
    
    var loadBoardSettingsForm = function(board) {
        notepanel.template.templates.loadBoardSettingsForm(board);
    };
    
    /*
    var onCreateBoard = function (e) {
        if($('#i_board_name').val() != '') {
            var postData = new Object();
            postData["boardName"] = $('#i_board_name').val();
            postData["boardPrivacy"] = $('input[type=radio][name=i_board_privacy]:checked').val();
            postData["defaultOptions"] = notepanel.enums.boardOptions.NONE;
            if($('input[type=checkbox]:checked').val()) {
                postData["defaultOptions"] = $('input[type=checkbox]:checked').val();
            }
            console.log(postData);
            $.ajax({type: 'POST',
                    url: 'board/add',
                    xhrFields: {withCredentials: true},
                    dataType: 'json',
                    data: postData
                })
                .done(function (data) {
                    $('#i_board_name').val(null);
                    notepanel.views.panel.setBoard(data.board, notepanel.enums.userGroups.OWNER);
                })
                .fail(notepanel.ajaxErrorHandler);
            me.disable();
        }
        return false;
    };
    */
    var onClose = function (e) {
        me.disable();
    };
    
    return me;
}(notepanel.views.boardsettings || {});
