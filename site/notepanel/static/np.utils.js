function isInRectangle(x, y, rectangleX, rectangleY, rectangleWidth, rectangleHeight) {
	return x > rectangleX
		&& x < rectangleX + rectangleWidth
		&& y > rectangleY
		&& y < rectangleY + rectangleHeight;
}

function showEditNote(note, context) {
	$('#texta_note').text = note.text;
	$('#texta_note').keyup(function(){
		text = $('#texta_note').val();
		note.text = text;
		note.drawText(context);
	});
	// left = board.x + note.x + note.width + 30 // at the rignt of the note
	x = 10 + note.x + 30;
	// top = board.y + note.y + note.height + 30 // above the note
	y = 10 + note.y + note.height + 10;
	$("#div_edit").css({position:"absolute",left:x,top:y});
	$('#div_edit').show(10, function(){
		$('#texta_note').focus();
	});				
}
			
function closeEditNote() {
	$('#div_edit').hide();
	$('#texta_note').empty();
}