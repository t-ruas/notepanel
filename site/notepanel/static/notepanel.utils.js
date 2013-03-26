if (typeof notepanel == 'undefined') var notepanel = {}; 
notepanel.utils = notepanel.utils || {};

notepanel.utils.isInRectangle = function (pt, rect) {
    return pt.x > rect.x
        && pt.x < rect.x + rect.width
        && pt.y > rect.y
        && pt.y < rect.y + rect.height;
};

notepanel.utils.positionNearNote = function(element, note) {
    var x, y;
    var margin = window.innerWidth / 3;
    if (note.location.x > window.innerWidth - margin) { // note in the right part
        x = note.location.x - (element.width + 30); // edit form at the left of the note
    } else if (note.location.x < margin) { // note in the left part
        x = note.location.x + note.location.width + 30; // edit form at the right of the note
    } else { // note in the central part
        x = note.location.x + note.location.width + 30; // edit form at the right of the note
    }
    // top = board.y + note.y + note.height + 30 // above the note
    y = note.location.y + 5;
    $(element).css({position:"absolute",left:x,top:y});
};