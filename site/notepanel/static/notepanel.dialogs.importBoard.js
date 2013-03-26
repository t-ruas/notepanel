
notepanel.dialogs = notepanel.dialogs || {};

notepanel.dialogs.importBoard = function (me) {

    me.open = function (callback) {
        callback(notepanel.template.templates.loadDialogImportBoard());
        $('#a_import_board').on('click', onImportBoard);
    };

    var onImportBoard = function(e) {
        var formData = new FormData(document.forms.namedItem('f_import_board'));
        if($('#i_import_board').val()) {
            $.ajax({type: 'POST',
                        url: '/board/import',
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

    return me;
}(notepanel.dialogs.importBoard || {});
