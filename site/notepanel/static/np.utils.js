function isInRectangle(x, y, rectangleX, rectangleY, rectangleWidth, rectangleHeight) {
	return x > rectangleX
		&& x < rectangleX + rectangleWidth
		&& y > rectangleY
		&& y < rectangleY + rectangleHeight;
}

function showEditNote(note, context) {
	alert(note.id);
	$('#texta_note').val(note.text);
	$('#texta_note').on('keyup', function(){
		var text = $('#texta_note').val();
		note.text = note.id + ' : ' + text;
		note.drawText(context);
	});
	// left = board.x + note.x + note.width + 30 // at the rignt of the note
	var boardX = 10;
	var boardY = 10;
	var x, y;
	var margin = window.innerWidth / 3;
	if (note.x > window.innerWidth - margin) { // note in the right part
		x = note.x - (300 + 30); // edit form at the left of the note
	} else if (note.x < margin) { // note in the left part
		x = note.x + note.width + 30; // edit form at the right of the note
	} else { // note in the central part
		x = note.x + note.width + 30; // edit form at the right of the note
	}
	// top = board.y + note.y + note.height + 30 // above the note
	y = note.y + 5;
	$("#div_edit").css({position:"absolute",left:x,top:y});
	$('#div_edit').show(10, function(){
		$('#texta_note').focus();
	});				
}
			
function closeEditNote() {
	$('#div_edit').hide();
	$('#texta_note').off('keyup');
	$('#texta_note').empty();
}