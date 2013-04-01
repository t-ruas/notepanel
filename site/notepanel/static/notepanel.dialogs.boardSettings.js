
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.boardSettings = function (me) {

    // Enable this view
    me.open = function (callback) {
		var board = notepanel.views.panel.getBoard();
        callback(notepanel.template.templates.loadBoardSettingsForm(board));
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
    
    return me;
}(notepanel.dialogs.boardsettings || {});
