
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

    // Default not size
    var noteWidth = 175;
    var noteHeight = 100;

    // Name of the board
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
            $canvas.css('cursor', 'default');
            $.ajax({url: notepanel.urls.note.move, type: 'POST', dataType: 'json', data: {version: version, note: movingNote}}).done(function (data) {
                /*
                 * TODO : nothing returned?
                 */
            });
            mode = 0;
            movingNote = null;
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

    };

    // Load data for this view
    me.loadData = function (board) {
        me.name = board.name;
        me.version = board.version;
        $('#s_board_name').html(me.name);
        me.notes = board.notes;
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
        notes.push({
            text: 'new sticky note',
            color: '#66aaee',
            x: x,
            y: y
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
            if (mode === modes.note && note === note) {
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
