
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.newBoard = function (me) {

    me.open = function (callback) {
        callback(notepanel.template.templates.loadDialogCreateBoard());
        $('#a_create_board').on('click', onCreateBoard);
        $('#i_board_privacy_private').on('click', onChoosePrivateBoard);
        $('#i_board_privacy_public').on('click', onChoosePublicBoard);
    };

    var onCreateBoard = function (e) {
        if($('#i_board_name').val().length) {
            var postData = {};
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

    var onChoosePrivateBoard = function (e) {
        $('#l_public_add_note').hide();
    }

    var onChoosePublicBoard = function (e) {
        $('#l_public_add_note').show();
    }

    return me;
}(notepanel.dialogs.newBoard || {});
