
notepanel.views.edit = function (me) {

    var context = null;

    var enabled = false;

    var note = null;

    $(document).ready(function () {
        $('#div_edit').hide();
    });

    // Enable this view
    me.enable = function (n) {
        note = n;
        if (!enabled) {
            var shapes = notepanel.notes.designers[note.template].shapes;
            var $divEdit = $("#div_edit");
            var $fields = $('#div_edit_fields');
            for (var i = 0, imax = shapes.length; i < imax; i++) {
                for (var m in shapes[i]) {
                    var property = shapes[i][m];
                    if (typeof property === 'object') {
                        (function (property) {
                            $fields.append('<div>' + property.title + '</div>');
                            switch (property.type) {
                                case notepanel.notes.editorType.TEXTAREA:
                                    var $ta = $('<textarea rows="5" cols="25">' + (note.value[property.name] || '') + '</textarea>');
                                    $ta.on('keyup', function () {
                                        note.value[property.name] = $(this).val();
                                    });
                                    $fields.append($ta);
                                    break;
                                case notepanel.notes.editorType.COLORPICKER:
                                    var $picker = notepanel.template.templates.loadColorPicker(function () {
                                        note.value[property.name] = notepanel.colors.toRgbInt(notepanel.colors.fromHexString(this.id));
                                    });
                                    $fields.append($picker);
                                    break;
                            }
                        })(property);
                    }
                }
            }
            notepanel.utils.positionNearNote($divEdit, note);
            $('#a_close_edit').on('click', onClose);
            $divEdit.show();
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            note = null;
            $('#a_close_edit').off('click');
            $('#div_edit').hide();
            $('#div_edit_fields').empty();
            enabled = false;
        }
    };

    var onClose = function (e) {
        var data = {
            id: note.id,
            value: note.value,
            update: notepanel.notes.updateType.VALUE
        };
        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/notes',
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
