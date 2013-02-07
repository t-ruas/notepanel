
notepanel.views.menu = function (me) {

    // Disable this view
    me.disable = function () {

        // Remove event handlers
        $('#a_logout').off('.notepanel');
        $('#a_add_note').off('.notepanel');
        $('#a_create_board').off('.notepanel');

        $('#div_menu:visible').hide();
    };

    // Enable this view
    me.enable = function () {

       $('#div_menu:hidden').show();

        $('#a_logout').on('click.notepanel', function (e) {
            $.ajax({type: 'GET',
                    url: notepanel.servicesUrl + '/users/logout',
                    dataType: 'json'})
                .done(function (data) {
                    notepanel.reset();
                })
                .fail(notepanel.ajaxErrorHandler);
            return false;
        });

        $('#a_add_note').on('click.notepanel', function (e) {
            notepanel.views.panel.addNote();
            me.disable();
            return false;
        });

        $('#a_create_board').on('click.notepanel', function (e) {
            $('#div_create_board_result').empty();

            var data = $('#i_create_board').serialize();

            $.ajax({type: 'POST',
                    url: notepanel.servicesUrl + '/boards',
                    dataType: 'json',
                    data: JSON.stringify(data)})
                .done(function (data) {
                    notepanel.views.panel.setBoard(data.board);
                })
                .fail(notepanel.ajaxErrorHandler);

            me.disable();
            return false;
        });
    };

    return me;
}(notepanel.views.menu || {});
