notepanel.views.edit = function (me) {
    
    var context = null;
    
    var enabled = false;

    $(document).ready(function () {
        $('#div_edit').hide();
    });
    
    // Enable this view
    me.enable = function (boardX, boardY, currentNote) {
        var note = currentNote;
        $('#texta_note').val(note.text);
        if (!enabled) {
            $divEdit = $("#div_edit");
            notepanel.utils.positionNearNote($divEdit, boardX, boardY, note)
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
            $('#div_edit').hide();
            enabled = false;
        }
    };
    
    var onCloseEdit = function () {
        me.disable();
    };
    
    var onKeyUp = function (e) {
        var text = $('#texta_note').val();
        e.data.note.text = text;
        e.data.note.drawText(context);
    };
    
    return me;
}(notepanel.views.edit || {});