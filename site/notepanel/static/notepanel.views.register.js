
notepanel.views.register = function (me) {

    // Disable this view
    me.disable = function () {

        // Remove event handlers
        $('#a_register').off('.notepanel');

        $('#div_register').hide();
        $('#div_register_result').empty();
    };

    // Enable this view
    me.enable = function () {

        $('#div_register').show();

        $('#a_register').on('click.notepanel', function (e) {

            $('#div_register_result').empty();

            var data = $('#div_register :input').serializeObject();
            
            $.ajax({type: 'POST',
                    url: notepanel.servicesUrl + '/users',
                    dataType: 'json',
                    data: JSON.stringify(data)})
                .done(function (data) {
                    if (data.identified) {
                        notepanel.user = data;
                        me.disable();
                        notepanel.views.panel.enable();
                    } else {
                        $('#div_register_result').text('Error.');
                    }
                })
                .fail(notepanel.ajaxErrorHandler);

            return false;
        });
    };

    return me;
}(notepanel.views.register || {});
