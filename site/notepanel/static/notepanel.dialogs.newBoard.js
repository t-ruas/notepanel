
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.newBoard = function (me) {

    me.container = '#div_new_board';

    me.enable = function () {
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
    };

    me.disable = function () {
        $('#a_create_board').off('click');
        $('#i_board_privacy_private').off('click');
        $('#i_board_privacy_public').off('click');
        $('#div_new_board #s_close').off('click');
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
            notepanel.windowManager.closeDialog(me);
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
        notepanel.windowManager.closeDialog(me);
    };
    
    return me;
}(notepanel.dialogs.newBoard || {});
