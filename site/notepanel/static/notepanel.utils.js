if (typeof notepanel == 'undefined') var notepanel = {}; 
notepanel.utils = notepanel.utils || {};

notepanel.utils.isInRectangle = function (x, y, rect) {
    return x > rect.x
        && x < rect.x + rect.width
        && y > rect.y
        && y < rect.y + rect.height;
};

notepanel.utils.positionNearNote = function(element, boardX, boardY, note) {
    var x, y;
    var margin = window.innerWidth / 3;
    if (note.x > window.innerWidth - margin) { // note in the right part
        x = boardX + note.x - (element.width + 30); // edit form at the left of the note
    } else if (note.x < margin) { // note in the left part
        x = boardX + note.x + note.width + 30; // edit form at the right of the note
    } else { // note in the central part
        x = boardX + note.x + note.width + 30; // edit form at the right of the note
    }
    // top = board.y + note.y + note.height + 30 // above the note
    y = boardY + note.y + 5;
    $(element).css({position:"absolute",left:x,top:y});
};