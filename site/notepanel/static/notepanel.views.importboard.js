
notepanel.views.importboard = function (me) {

    var enabled = false;

    $(document).ready(function () {
        $('#div_import_board').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            notepanel.views.mainmenu.disactivate();
            notepanel.views.menu.disactivate();
            notepanel.views.panel.lock();
            $('#a_import_board').on('click', onImportBoard);
            $('#s_import_board_close').on('click', onClose);
            $('#div_import_board').show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            notepanel.views.mainmenu.activate();
            notepanel.views.menu.activate();
            notepanel.views.panel.unlock();
            $('#a_import_board').off('click');
            $('#s_import_board_close').off('click');
            $('#div_import_board').hide();
            enabled = false;
        }
    };

    var onImportBoard = function(e) {
        var formData = new FormData(document.forms.namedItem('f_import_board'));
        if($('#i_import_board').val()) {
            $.ajax({type: 'POST',
                        url: '/board/import',
                        xhrFields: {withCredentials: true},
                        dataType: 'json',
                        data: formData,
                        processData: false,
                        contentType: false})
                    .done(function (data) {
                        if(data.uploaded) {
                            $('#s_import_board').text('Board imported');
                        } else {
                            $('#s_import_board').text(data.message);
                        }
                        $('#s_import_board').fadeIn(2000, function() {
                            $('#s_import_board').fadeOut(2000);
                        });
                    })
                    .fail(notepanel.ajaxErrorHandler);
        }
        // empty the file input field
        $('#i_import_board').replaceWith( $('#i_import_board').val('').clone( true ) );
        return false;
    }
    
    var onClose = function (e) {
        me.disable();
    };
    
    return me;
}(notepanel.views.importboard || {});
