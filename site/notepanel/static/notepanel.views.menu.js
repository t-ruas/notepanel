
notepanel.views.menu = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_menu').hide();
    });

    me.activate = function () {
        $(window).on('mousemove.notepanel', onWindowMouseMove);
    };

    me.disactivate = function () {
        $(window).off('mousemove.notepanel');
    };

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            $('#a_logout').on('click', onLogout);
            $('#a_add_note').on('click', onAddNote);
            $('#a_create_board').on('click', onCreateBoard);
            $('#a_refresh_boards').on('click', onRefreshBoards);
            $('#sel_choose_board').on('change', onChooseBoard);
            $('#a_invite_user').on('click', onInviteUser);
            $('#div_menu').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_logout').off('click');
            $('#a_add_note').off('click');
            $('#a_create_board').off('click');
            $('#a_refresh_boards').off('click');
            $('#sel_choose_board').off('change');
            $('#a_invite_user').off('click');
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
                url: notepanel.servicesUrl + '/users/logout',
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {
                notepanel.reset();
            })
            .fail(notepanel.ajaxErrorHandler);
        /*
        $.ajax({type: 'GET',
                url: '/logout',
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {});
        */
        return false;
    };

    var onAddNote = function (e) {
        notepanel.views.panel.addNote();
        me.disable();
        return false;
    };

    var onCreateBoard = function (e) {
        var board = {name: $('#i_create_board').val()};
        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/boards',
                xhrFields: {withCredentials: true},
                dataType: 'json',
                data: JSON.stringify(board)})
            .done(function (data) {
                $('#i_create_board').val(null);
                board.id = data.id;
                notepanel.views.panel.setBoard(board);
                me.refreshBoards();
            })
            .fail(notepanel.ajaxErrorHandler);
        me.disable();
        return false;
    };

    var onRefreshBoards = function (e) {
        me.refreshBoards();
        return false;
    };

    me.refreshBoards = function () {
        var $select = $('#sel_choose_board').empty().attr('disabled', 'disabled');
        $select.append('<option value="0">---</option>');
        $('#div_no_boards').hide();
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/boards',
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {
                for (var i = 0, imax = data.length; i < imax; i++) {
                    $select.append('<option value="' + data[i].id + '"' + (data[i].id === notepanel.views.panel.getBoardId() ? ' selected="selected"' : '') + '>' + data[i].name + '</option>');
                }
                $select.attr('disabled', null);
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    var onChooseBoard = function (e) {
        notepanel.views.wait.enable();
        var board = {id: parseInt($(this).val()), name: $(this).text()};
        notepanel.views.panel.setBoard(board);
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/boards/users?boardId=' + board.id,
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {
                notepanel.template.templates.loadBoardUserList(data.boardUsers);
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    var onInviteUser = function(e) {
        var boardId = $('#sel_choose_board').val();
        var userName = $('#i_invite_user').val();
        var userGroup = $('#sel_choose_user_group').val();
        if(userName.length>0) {
            $.ajax({type: 'GET',
                    url: '/boards/' + boardId + '/users/add/' + userName + '/' + userGroup, //notepanel.servicesUrl + '/users/logout',
                    xhrFields: {withCredentials: true},
                    dataType: 'json'})
                .done(function (data) {
                    $('#i_invite_user').val('');
                    notepanel.template.templates.loadBoardUserList(data.boardUsers);
                })
                .fail(notepanel.ajaxErrorHandler);
        }
        return false;
    };

    return me;
}(notepanel.views.menu || {});
