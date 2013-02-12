function isInRectangle(x, y, rectangleX, rectangleY, rectangleWidth, rectangleHeight) {
    return x > rectangleX
        && x < rectangleX + rectangleWidth
        && y > rectangleY
        && y < rectangleY + rectangleHeight;
}

function showEditNote(boardX, boardY, note, context) {
    $('#texta_note').val(note.text);
    // left = board.x + note.x + note.width + 30 // at the rignt of the note
    var x, y;
    var margin = window.innerWidth / 3;
    if (note.x > window.innerWidth - margin) { // note in the right part
        x = boardX + note.x - (300 + 30); // edit form at the left of the note
    } else if (note.x < margin) { // note in the left part
        x = boardX + note.x + note.width + 30; // edit form at the right of the note
    } else { // note in the central part
        x = boardX + note.x + note.width + 30; // edit form at the right of the note
    }
    // top = board.y + note.y + note.height + 30 // above the note
    y = boardY + note.y + 5;
    $("#div_edit").css({position:"absolute",left:x,top:y});
    $('#div_edit').show(10, function(){
        $('#texta_note').focus();
    });

    $('#a_close_edit').on("click", function() {
        closeEditNote(note, context);
    });
    
    $('#texta_note').on('keyup', function(){
        var text = $('#texta_note').val();
        note.text = text;
        note.drawText(context);
    });
}

function closeEditNote(note, context) {
    $('#div_edit').hide();
    $('#texta_note').off('keyup');
    $('#a_close_edit').off("click");
}