
notepanel.ajaxErrorHandler = function (xhr) {
    notepanel.views.error.enable();
};

notepanel.views.error = function (me) {

    // Disable this view
    me.disable = function () {
        // Hide everything
        $('#div_fatal').hide();
    };

    // Enable this view
    me.enable = function () {
        $('#div_fatal').show();
    };

    return me;
}(notepanel.views.error || {});

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
            $.ajax({type: 'GET',
                    url: notepanel.servicesUrl + '/users/login?' + $('#div_login :input').serialize(),
                    dataType: 'json'})
                .done(function (data) {
                    notepanel.user = data.user;
                    notepanel.views.panel.setBoard(data.boards[0]);
                    me.disable();
                    notepanel.views.panel.enable();
                })
                .fail(function (xhr) {
                    if (xhr.status === 403) {
                        $('#div_login_result').text('Wrong user name/password.');
                    } else {
                        notepanel.ajaxErrorHandler.apply(this, arguments);
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

            var data = $('#div_register :input').serializeObject();
            
            $.ajax({type: 'POST',
                    url: notepanel.servicesUrl + '/users',
                    dataType: 'json',
                    data: JSON.stringify(data)})
                .done(function (data) {
                    if (data.identified) {
                        notepanel.user = data;
                        me.disable();
                        notepanel.views.panel.enable();
                    } else {
                        $('#div_register_result').text('Error.');
                    }
                })
                .fail(notepanel.ajaxErrorHandler);

            return false;
        });
    };

    return me;
}(notepanel.views.register || {});

notepanel.views.panel = function (me) {

    // Default note size
    var noteWidth = 175;
    var noteHeight = 100;

    // Id and name of the displayed board
    var currentBoard = null;

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

    // Keep a reference to the running long polling xhr so we can abort it
    var currentPollXhr = null;

    // Current dragging mode
    var mode = modes.still;

    // Currently dragged note
    var movingNote = null;

    // Currently overed note
    var overedNote = null;

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

    var poll = function () {
        if (currentPollXhr) {
            currentPollXhr.abort();
        }
        currentPollXhr = $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/boards/poll?boardId=' + currentBoard.id + '&version=' + version,
                dataType: 'json',
                /* timeout: 30000,*/})
            .done(function (data, status, xhr) {
                // Ignore the response if it's from a previous, aborted ajax call
                if (xhr === currentPollXhr) {
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
                    currentPollXhr = null;
                    poll();
                }
            })
            .fail(function (xhr) {
                if (xhr === currentPollXhr) {
                    notepanel.ajaxErrorHandler.apply(this, arguments);
                }
            });
    };

    // Enable this view
    me.enable = function () {

        var $canvas = $('#canvas_board').show();
        var context = $canvas.get(0).getContext('2d');

        // Start the main draw loop
        window.setInterval(function () {draw(context);}, 50);

        $canvas.on('mousedown.notepanel', function (e) {
            var note = hitTest(e.clientX, e.clientY);
            if (note) {
                if (note.onMouseDown(e)) { // click on note menu
                    mode = modes.still;
                } else {
                    mode = modes.note;
                    movingNote = note;
                }
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
                    // TODO : move into draw() method ?
                    if (overedNote && overedNote.menu.isMouseOver(lastX, lastY)) {
                        $canvas.css('cursor', 'pointer');
                    } else {
                        $canvas.css('cursor', 'default');
                    }
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
            }
            lastX = e.clientX;
            lastY = e.clientY;
        });

        $canvas.on('mouseup.notepanel', function (e) {
            if (mode === modes.note) {

                var data = {
                    boardId: currentBoard.id,
                    id: movingNote.id,
                    text: movingNote.text,
                    x: movingNote.x,
                    y: movingNote.y,
                    color: movingNote.color
                };

                $.ajax({type: 'POST',
                        url: notepanel.servicesUrl + '/notes',
                        dataType: 'json',
                        data: JSON.stringify(data)})
                    .fail(notepanel.globalErrorHandler);

                movingNote = null;
            }
            $canvas.css('cursor', 'default');
            mode = modes.still;
        });

        // Menu events

        $('#a_logout').on('click.notepanel', function (e) {
            me.disable();
            $.ajax({type: 'GET',
                    url: notepanel.servicesUrl + '/users/logout',
                    dataType: 'json'})
                .done(function (data) {
                    notepanel.user = null;
                    notepanel.views.login.enable();
                })
                .fail(notepanel.ajaxErrorHandler);
            return false;
        });

        $('#a_add_note').on('click.notepanel', function (e) {
            addNote(50, 50);
            $('#div_menu').hide();
            return false;
        });

        $('#a_create_board').on('click.notepanel', function (e) {
            $('#div_create_board_result').empty();

            var data = $('#i_create_board').serialize();

            $.ajax({type: 'POST',
                    url: notepanel.servicesUrl + '/boards',
                    dataType: 'json',
                    data: JSON.stringify(data)})
                .done(function (data) {
                    me.setBoard(data.board);
                })
                .fail(notepanel.ajaxErrorHandler);

            $('#div_menu').hide();
            return false;
        });

        $('#a_close_edit').on('click.notepanel', function (e) {
            closeEditNote();
            return false;
        });
    };

    // Set the currently open board
    me.setBoard = function (board) {
        currentBoard = board;
        getBoardNotes();
        $('#s_board_name').html(currentBoard.name);
    };

    // Refresh the current board's note list
    var getBoardNotes = function () {
        notes.length = 0;
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/notes?boardId=' + currentBoard.id,
                dataType: 'json',
                /* timeout: 30000,*/})
            .done(function (data) {

                for (var i = 0, imax = data.notes.length; i < imax; i++) {
                    notes.push(new Note(data.notes[i]));
                }

                version = data.version;

                // Start polling only now that we have the current server side cache version
                poll();
            })
            .fail(notepanel.ajaxErrorHandler);
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
        var position = {x: x, y: y};
        var note = new Note(position);

        var data = {
            boardId: currentBoard.id,
            text: note.text,
            x: note.x,
            y: note.y,
            color: note.color
        };

        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/notes',
                dataType: 'json',
                data: JSON.stringify(data)})
            .done(function (data) {
                note.id = data.id;
                notes.push(note);
            })
            .fail(notepanel.ajaxErrorHandler);
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
       overedNote = null;
        document.body.style.cursor = '';
        for (var i = 0, imax = notes.length; i < imax; i++) {
            var note = notes[i];
            if (note) {
                if (note.isMouseOver(lastX, lastY)) {
                    // draw note menu on the overed note
                    overedNote = note;
                    note.isMenuVisible = true;
                } else {
                    note.isMenuVisible = false;
                }
                drawNote(context, note);
            }
        }
    };

    //Draw one note
    var drawNote = function (context, note) {
        context.beginPath();
        context.moveTo(note.x + boardX, note.y + boardY);
        context.lineTo(note.x + noteWidth + boardX, note.y + boardY);
        context.lineTo(note.x + noteWidth + boardX, note.y + noteHeight + boardY);
        context.lineTo(note.x + boardX, note.y + noteHeight + boardY);
        context.closePath();
        if (mode === modes.note && note === movingNote) {
            context.strokeStyle = '#444444';
            context.fillStyle = '#' + note.color;
        } else {
            context.strokeStyle = '#888888';
            context.fillStyle = '#' + note.color;
        }
        context.stroke();
        context.fill();
        // draw note text
        note.drawText(context);
        // draw note menu
        if (note.isMenuVisible) {
            note.drawMenu(context);
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

    // Note class
    var Note = function (options) {
        this.id = null;
        this.x = 0;
        this.y = 0;
        this.width = 175;
        this.height = 100;
        this.text = 'new sticky note';
        this.color = '66aaee';
        this.template = 'default';
        this.isMenuVisible = false;

        // merge options in Note
        $.extend(this, options);
    };

    Note.prototype.drawMenu = function(context) {
        menu = new NoteMenu();
        this.menu = menu;
        menu.addItem(new NoteMenuItem("d"));
        var editItem = new NoteMenuItem("e");
        note = this;
        editItem.onClick = function() {
            showEditNote(note, context);
        }
        menu.addItem(editItem);
        // this logic should be in the note template
        context.font='bold 16px sans-serif';
        context.fillStyle = "#fff";
        // TODO : manage template with menu starting either from left and right
        startX = boardX + this.x + this.width; // from right
        // menu starting from right
        for(i=0;i<menu.items.length;i++) {
            item = menu.items[i];
            item.width = 10
            menu.width += item.width;
        }
        menu.x = startX - menu.width;
        menu.items.reverse();
        // menu starting from left
        //startX = boardX + this.x
        //menu.x = startX
        // drawing menu from left
        menu.height = 10;
        menu.y = boardY + this.y; // from bottom
        for(i=0;i<menu.items.length;i++) {
            item = menu.items[i];
            item.y = menu.y;
            item.height = menu.height;
            item.width = 10
            item.x = menu.x + (i*item.width);
            context.fillText(item.text, item.x, item.y + menu.height);
        }
        this.menu = menu;
    };

    Note.prototype.isMouseOver = function(x, y) {
        return isInRectangle(x, y, boardX + this.x, boardY + this.y, this.width, this.height);
    };

    Note.prototype.onMouseDown = function(e) {
        var isEventHandled = false;
        x = e.clientX;
        y = e.clientY;
        if (this.isMouseOver(x, y)) {
            if(this.menu.isMouseOver(x, y)) {
                for(i=0;i<this.menu.items.length;i++) {
                    var item = this.menu.items[i];
                    if(item.isMouseOver(x, y)) {
                        isEventHandled = true;
                        item.onClick();
                    }
                }

            }
        }
        return isEventHandled;
    };

    Note.prototype.drawText = function(context) {
        var text = this.text;
        // x = this.x + left margin;
        var x = this.x + 10;
        // TODO : y (bottom) = this.y + menu.height + line.height
        var y = this.y + 10 + 15;
        // TODOD : width = this.width - (left margin + right margin)
        var width = this.width - (10 + 10);
        CanvasText.drawText({
            text: text,
            x: x,
            y: y,
            boxWidth: width
        });
    };

    // Note menu class
    var NoteMenu = function() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.items = [];
    };

    // to add in "ordered way"
    NoteMenu.prototype.addItem = function(item) {
        this.items.push(item);
    };

    NoteMenu.prototype.isMouseOver = function(x, y) {
        return isInRectangle(x, y, this.x, this.y, this.width, this.height);
    };

    // Note menu item class
    var NoteMenuItem = function(action) {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.text = action;
        this.onClick = function() { alert(action); };
    };

    NoteMenuItem.prototype.isMouseOver = function(x, y) {
        return isInRectangle(x, y, this.x, this.y, this.width, this.height);
    };

    return me;
}(notepanel.views.panel || {});

$(document).ready(function () {

    notepanel.views.login.disable();
    notepanel.views.register.disable();
    notepanel.views.panel.disable();
    notepanel.views.error.disable();

    $.ajax({type: 'GET',
            url: notepanel.servicesUrl + '/users/identify',
            dataType: 'json'})
        .done(function (data) {
            notepanel.user = data.user;
            notepanel.views.panel.setBoard(data.boards[0]);
            notepanel.views.panel.enable();
        })
        .fail(function (xhr) {
            if (xhr.status === 403) {
                notepanel.views.login.enable();
            } else {
                notepanel.ajaxErrorHandler.apply(this, arguments);
            }
        });
});
