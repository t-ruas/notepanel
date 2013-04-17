
notepanel.views.edit = function (me) {

    var note = null;
    var $divEdit = null;

    me.enable = function (n) {
        note = n;
        if (!$divEdit) {
            var shapes = notepanel.notes.designers[note.template].shapes;
            $divEdit = $(notepanel.templates.noteEditor());
            var $fields = $('#div_edit_fields', $divEdit);
            for (var i = 0, imax = shapes.length; i < imax; i++) {
                for (var m in shapes[i]) {
                    var property = shapes[i][m];
                    if (typeof property === 'object') {
                        (function (property) {
                            $fields.append('<div>' + property.title + '</div>');
                            switch (property.type) {
                                case notepanel.notes.editorType.TEXTAREA:
                                    var $ta = $('<textarea rows="5" cols="25"' + (property.max ? ' maxlength="' + property.max + '"' : '') + '>' + (note.value[property.name] || '') + '</textarea>');
                                    $ta.on('keyup', function () {
                                        note.value[property.name] = $(this).val();
                                    });
                                    $fields.append($ta);
                                    break;
                                case notepanel.notes.editorType.COLORPICKER:
                                    var $picker = $(notepanel.templates.colorPicker());
                                    $('div', $picker).on('click', function () {
                                        note.value[property.name] = notepanel.colors.toRgbInt(notepanel.colors.fromHexString($(this).attr('value')));
                                    });
                                    $fields.append($picker);
                                    break;
                            }
                        })(property);
                    }
                }
            }
            notepanel.utils.positionNearNote($divEdit, note);
            $('#a_close_edit', $divEdit).on('click', onClose);
            $('body').append($divEdit);
        }
    };

    me.disable = function () {
        if ($divEdit) {
            note = null;
            $divEdit.remove();
            $divEdit = null;
        }
    };

    var onClose = function (e) {
        var data = {
            id: note.id,
            value: note.value,
            update: notepanel.notes.updateType.VALUE
        };
        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/notes/' + note.id,
                xhrFields: {withCredentials: true},
                dataType: 'json',
                data: JSON.stringify(data)})
            .fail(notepanel.globalErrorHandler);
        me.disable();
        notepanel.views.panel.unlock();
        return false;
    };

    return me;
}(notepanel.views.edit || {});
