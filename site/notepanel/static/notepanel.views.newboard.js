
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
            // reset form
            $('#i_board_name').val('');
            $('#i_board_privacy_private').attr('checked', true);
            $('#i_board_privacy_public').attr('checked', false);
            $('#i_public_add_note').attr('checked', false);
            $('#l_public_add_note').hide();
            // events
            $('#a_create_board').on('click', onCreateBoard);
            $('#i_board_privacy_private').on('click', onChoosePrivateBoard);
            $('#i_board_privacy_public').on('click', onChoosePublicBoard);
            $('#div_new_board #s_close').on('click', onClose);
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
            $('#i_board_privacy_private').off('click');
            $('#i_board_privacy_public').off('click');
            $('#div_new_board #s_close').off('click');
            $('#div_new_board').hide();
            enabled = false;
        }
    };

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
    
    var onChoosePrivateBoard = function(e) {
        $('#l_public_add_note').hide();  
    }
    
    var onChoosePublicBoard = function(e) {
        $('#l_public_add_note').show();  
    }
    
    var onClose = function (e) {
        me.disable();
    };
    
    return me;
}(notepanel.views.newboard || {});
