
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
                            $fields.append('<p>' + property.title + '</p>');
                            switch (property.type) {
                                case notepanel.notes.editorType.textarea:
                                    var $ta = $('<textarea rows="5" cols="25" name="' + property.name + '">' + note.value[property.name] + '</textarea>');
                                    $ta.on('keyup', function () {
                                        note.value[property.name] = $(this).val();
                                    });
                                    $fields.append($ta);
                                    break;
                                case notepanel.notes.editorType.colorPicker:
                                    var $inpt = $('<input type="hidden" name="' + property.name + ' value="' + note.value[property.name] + '" />');
                                    $fields.append($inpt);
                                    $inpt.on('change', function () {
                                        note.value[property.name] = $(this).val();
                                    });
                                    break;
                            }
                        })(property);
                    }
                }
            }
            notepanel.utils.positionNearNote($divEdit, note);
            $divEdit.show();
            enabled = true;
        }
        
        /*
        var note = currentNote;
        $('#texta_note').val(note.text);
        
            $divEdit = $("#div_edit");
            // color picker
            var onClick = function(event) { 
                currentNote.color = this.id; 
                event.stopPropagation();
            };
            notepanel.template.templates.loadColorPicker(onClick);
            notepanel.utils.positionNearNote($divEdit, note)
            $('#a_close_edit').on('click', onCloseEdit);
            $('#texta_note').on('keyup', { note: note }, onKeyUp);
            $('#div_edit').show();
            enabled = true;
        }
        */
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_close_edit').off('click');
            //$('#texta_note').off('keyup');
            //$('#sel_choose_fontsize').off('change');
            $('#div_edit').hide();
            $('#div_edit_fields').empty();
            enabled = false;
        }
    };
    
    var onClose = function (e) {
        var data = {
            boardId: note.boardId,
            id: note.id,
            value: note.value
        };
        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/notes',
                xhrFields: {withCredentials: true},
                dataType: 'json',
                data: JSON.stringify(data)})
            .fail(notepanel.globalErrorHandler);
        me.disable();
        notepanel.views.panel.unlock();
    };
    
    /*
    var onKeyUp = function (e) {
        var text = $('#texta_note').val();
        e.data.note.text = text;
        e.data.note.drawText(context);
    };
    
    var onFontSizeChante = function (e) {
        e.data.note.fontsize = ('#sel_choose_fontsize').val();
        console.log("new font size : " + e.data.note.fontsize);
        //e.data.note.drawText(context);
    }
    */
    
    return me;
}(notepanel.views.edit || {});
