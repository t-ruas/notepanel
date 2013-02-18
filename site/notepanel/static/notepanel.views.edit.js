notepanel.views.edit = function (me) {
    
    var context = null;
    
    var enabled = false;

    $(document).ready(function () {
        $('#div_edit').hide();
    });
    
    // Enable this view
    me.enable = function (currentNote) {
        var note = currentNote;
        $('#texta_note').val(note.text);
        if (!enabled) {
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
            $('#div_edit').show(10, function(){
                $('#texta_note').focus();
            });
            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            $('#a_close_edit').off('click');
            $('#texta_note').off('keyup');
            $('#sel_choose_fontsize').off('change');
            $('#div_edit').hide();
            enabled = false;
        }
    };
    
    var onCloseEdit = function () {
        me.disable();
        notepanel.views.panel.unlock();
    };
    
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
    
    return me;
}(notepanel.views.edit || {});