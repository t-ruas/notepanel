
notepanel.views.login = function (me) {

    // Disable this view
    me.disable = function () {
        // Remove event handlers
        $('#a_login').off('.notepanel');
        $('#a_to_register').off('.notepanel');

        // Hide everything
        $('#div_login').hide();
        $('#div_login_result').empty();
    };

    // Enable this view
    me.enable = function () {
        $('#div_login').show();
        $('#a_login').on('click.notepanel', function (e) {
            $('#div_login_result').empty();
            $.ajax({url: notepanel.urls.user.login, type: 'POST', dataType: 'json', data: $('#div_login :input').serialize()}).done(function (data) {
                if (data.identified) {
                    notepanel.user = data.user;
                    notepanel.views.panel.loadData(data.board);
                    me.disable();
                    notepanel.views.panel.enable();
                } else {
                    $('#div_login_result').text('Error.');
                }
            });
            return false;
        });
        $('#a_to_register').on('click.notepanel', function (e) {
            me.disable();
            notepanel.views.register.enable();
            return false;
        });
    };

    return me;
}(notepanel.views.login || {});

notepanel.views.register = function (me) {

    // Disable this view
    me.disable = function () {
        // Remove event handlers
        $('#a_register').off('.notepanel');

        // Hide everything
        $('#div_register').hide();
        $('#div_register_result').empty();
    };

    // Enable this view
    me.enable = function () {
        $('#div_register').show();
        $('#a_register').on('click.notepanel', function (e) {
            $('#div_register_result').empty();
            $.ajax({url: notepanel.urls.user.register, type: 'POST', dataType: 'json', data: $('#div_register :input').serialize()}).done(function (data) {
                if (data.identified) {
                    notepanel.user = data;
                    me.disable();
                    notepanel.views.panel.enable();
                } else {
                    $('#div_register_result').text('Error.');
                }
            });
            return false;
        });
    };

    return me;
}(notepanel.views.register || {});

notepanel.views.panel = function (me) {

    // Default note size
    var noteWidth = 175;
    var noteHeight = 100;

    // Id and name of the board
    var id = 0;
    var name = '';

    // Current version for synchronization
    var version = 0;

    // List of notes on the board
    var notes = [];

    // Current board position
    var boardX = 0;
    var boardY = 0;

    // Dragging modes
    var modes = {
        still: 0,
        board: 1,
        note: 2
    };

    // Current dragging mode
    var mode = modes.still;

    // Currently dragged note
    var movingNote = null;

    // Last mouse coordinates
    var lastX = 0;
    var lastY = 0;

    // Disable this view
    me.disable = function () {

        // Remove event handlers
        $('#canvas_board').off('.notepanel');
        $('#a_logout').off('.notepanel');
        $('#a_add_note').off('.notepanel');
        $('#a_create_board').off('.notepanel');

        // Hide everything
        $('#canvas_board').hide();
        $('#div_menu').hide();
    };

    me.poll = function () {
        $.ajax({url: notepanel.urls.board.poll + '?board_id=' + id + '&version=' + version, dataType: 'json',/* timeout: 30000,*/ data: movingNote})
            .done(function (data) {
                for (var j = 0, jmax = data.length; j < jmax; j++) {
                    found = false;
                    for (var i = 0, imax = notes.length; i < imax; i++) {
                        if (data[j].note.id === notes[i].id) {
                            // Copy all the new properties
                            notes[i].text = data[j].note.text;
                            notes[i].color = data[j].note.color;
                            notes[i].x = data[j].note.x;
                            notes[i].y = data[j].note.y;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        notes.push(data[j].note);
                    }
                    // Double check in case they aren't ordered
                    version = data[j].version > version ? data[j].version : version;
                }
            })
            .always(function () {
                me.poll();
            });
    };

    // Enable this view
    me.enable = function () {

        var $canvas = $('#canvas_board').show()
        var context = $canvas.get(0).getContext('2d');

        // Start the main draw loop
        window.setInterval(function () {draw(context);}, 50);

        $canvas.on('mousedown.notepanel', function (e) {
            var note = hitTest(e.clientX, e.clientY);
            if (note) {
                mode = modes.note;
                movingNote = note;
            } else {
                mode = modes.board;
            }
            lastX = e.clientX;
            lastY = e.clientY;
        });

        $canvas.on('mousemove.notepanel', function (e) {
            if (mode === modes.still) {
                if (e.clientX > window.innerWidth - 10) {
                    $('#div_menu:hidden').show();
                } else if (e.clientX < window.innerWidth - 10 - $('#div_menu').width()) {
                    $('#div_menu:visible').hide();
                }
            } else {
                $canvas.css('cursor', 'pointer');
                var deltaX = e.clientX - lastX;
                var deltaY = e.clientY - lastY;
                if (mode === modes.board) {
                    boardX += deltaX;
                    boardY += deltaY;
                } else if (mode === modes.note) {
                    movingNote.x += deltaX;
                    movingNote.y += deltaY;
                }
                lastX = e.clientX;
                lastY = e.clientY;
            }
        });

        $canvas.on('mouseup.notepanel', function (e) {
            if (mode === modes.note) {
                $.ajax({url: notepanel.urls.board.edit, type: 'POST', dataType: 'json', data: movingNote});
                movingNote = null;
            }
            $canvas.css('cursor', 'default');
            mode = modes.still;
        });

        // Menu events

        $('#a_logout').on('click.notepanel', function (e) {
            me.disable();
            $.ajax({url: notepanel.urls.user.logout}).done(function (data) {
                notepanel.user = null;
                notepanel.views.login.enable();
            });
            return false;
        });

        $('#a_add_note').on('click.notepanel', function (e) {
            addNote(50, 50);
            $('#div_menu').hide();
            return false;
        });

        $('#a_create_board').on('click.notepanel', function (e) {
            $('#div_create_board_result').empty();
            $.ajax({url: notepanel.urls.board.create, type: 'POST', dataType: 'json', data: $('#i_create_board').serialize()}).done(function (data) {
                if (data.board) {
                    me.loadData(data.board);
                } else {
                    $('#div_create_board_result').text('Error.');
                }
            });
            $('#div_menu').hide();
            return false;
        });

        me.poll();
    };

    // Load data for this view
    me.loadData = function (board) {
        id = board.id;
        name = board.name;
        $('#s_board_name').html(name);
    };

    var hitTest = function (x, y) {
        for (var i = 0, imax = notes.length; i < imax; i++) {
            var note = notes[i];
            if (x > note.x + boardX
                && x < note.x + noteWidth + boardX
                && y > note.y + boardY
                && y < note.y + noteHeight + boardY) {
                return note;
            }
        }
    };

    // Add a new note to the list
    var addNote = function (x, y) {
        var note = {
            id: 0,
            board_id: id,
            text: 'new sticky note',
            color: '#66aaee',
            x: x,
            y: y
        };
        notes.push(note);
        $.ajax({url: notepanel.urls.board.edit, type: 'POST', dataType: 'json', data: note}).done(function (data) {
            note.id = data.id;
        });
    };

    // Full redraw
    var draw = function (context) {
        context.canvas.width  = window.innerWidth;
        context.canvas.height = window.innerHeight;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawBoard(context);
        drawNotes(context);
    };

    // Draw each note in the list
    var drawNotes = function (context) {
        for (var i = 0, imax = notes.length; i < imax; i++) {
            var note = notes[i];
            context.beginPath();
            context.moveTo(note.x + boardX, note.y + boardY);
            context.lineTo(note.x + noteWidth + boardX, note.y + boardY);
            context.lineTo(note.x + noteWidth + boardX, note.y + noteHeight + boardY);
            context.lineTo(note.x + boardX, note.y + noteHeight + boardY);
            context.closePath();
            if (mode === modes.note && note === movingNote) {
                context.strokeStyle = '#444444';
                context.fillStyle = note.color;
            } else {
                context.strokeStyle = '#888888';
                context.fillStyle = note.color;
            }
            context.stroke();
            context.fill();
        }
    };

    // Draw the board
    var drawBoard = function (context) {
        context.beginPath();
        context.moveTo(10, 10);
        context.lineTo(context.canvas.width - 10, 10);
        context.lineTo(context.canvas.width - 10, context.canvas.height - 10);
        context.lineTo(10, context.canvas.height - 10);
        context.closePath();
        context.strokeStyle = '#888888';
        context.stroke();
        context.fillStyle = '#ffffee';
        context.fill();
    };

    return me;
}(notepanel.views.panel || {});

$(document).ready(function () {
    notepanel.views.login.disable();
    notepanel.views.register.disable();
    notepanel.views.panel.disable();
    $.ajax({url: notepanel.urls.user.identify, dataType: 'json'}).done(function (data) {
        if (data.identified) {
            notepanel.views.panel.enable();
        } else {
            notepanel.views.login.enable();
        }
    });
});
