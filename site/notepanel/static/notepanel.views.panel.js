
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

    var $canvas = null;

    // 2D drawing context
    var context = null;

    // Keep a reference to the running long polling xhr so we can abort it
    var currentPollXhr = null;

    // Current dragging mode
    var mode = modes.still;

    // Currently dragged note
    var movingNote = null;

    // Currently overed note
    var overedNote = null;

    // Loop timer so we can stop drawing during an update
    var currentTimer = null;

    // Last mouse coordinates
    var lastX = 0;
    var lastY = 0;

    var enabled = false;

    $(document).ready(function () {
        $canvas = $('#canvas_board');
        context = $canvas.get(0).getContext('2d');
        adjustCanvas();
        $('#div_panel').hide();
    });

    // Enable this view
    me.enable = function () {
        if (!enabled) {

            $canvas.on('mousedown', onMouseDown);
            $canvas.on('mousemove', onMouseMove);
            $canvas.on('mouseup', onMouseUp);

            //$('#a_close_edit').on('click.notepanel', onCloseEdit);

            $('#div_panel').show();

            notepanel.views.menu.activate();

            enabled = true;
        }
    };

    // Disable this view
    me.disable = function () {
        if (enabled) {
            notepanel.views.menu.disactivate();

            $canvas.off('mousedown');
            $canvas.off('mousemove');
            $canvas.off('mouseup');

            $('#div_panel').hide();

            interruptPolling();
            interruptDrawing();

            enabled = false;
        }
    };

    var onMouseMove = function (e) {
        if (mode === modes.still) {
            // TODO : move into draw() method ?
            if (overedNote && overedNote.menu.isMouseOver(lastX, lastY)) {
                $canvas.css('cursor', 'pointer');
            } else {
                $canvas.css('cursor', 'default');
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
    };

    var onMouseDown = function (e) {
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
    };

    var onMouseUp = function (e) {
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
                    xhrFields: {withCredentials: true},
                    dataType: 'json',
                    data: JSON.stringify(data)})
                .fail(notepanel.globalErrorHandler);

            movingNote = null;
        }
        $canvas.css('cursor', 'default');
        mode = modes.still;
    };

    var onCloseEdit = function (e) {
        closeEditNote();
        return false;
    };

    var interruptPolling = function () {
        if (currentPollXhr) {
            currentPollXhr.abort();
            currentPollXhr = null;
        }
    };

    var interruptDrawing = function () {
        if (currentTimer) {
            window.clearInterval(currentTimer);
            currentTimer = null;
        }
    };

    var poll = function () {
        interruptPolling();
        currentPollXhr = $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/boards/poll?boardId=' + currentBoard.id + '&version=' + version,
                xhrFields: {withCredentials: true},
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
                            notes.push(new Note(data[j].note));
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

    // Set the currently open board
    me.setBoard = function (board) {
        currentBoard = board;
        getBoardNotes();
    };

    me.getBoardId = function () {
        return currentBoard ? currentBoard.id : 0;
    }

    // Refresh the current board's note list
    var getBoardNotes = function () {
        interruptPolling();
        interruptDrawing();
        notes.length = 0;
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/notes?boardId=' + currentBoard.id,
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {

                for (var i = 0, imax = data.notes.length; i < imax; i++) {
                    notes.push(new Note(data.notes[i]));
                }

                // Version of the received update
                version = data.version;

                // Start polling only now that we have the current server side cache version
                poll();

                // Start the main draw loop
                currentTimer = window.setInterval(draw, 50);

                // Give access to the board now that it's set up
                notepanel.views.wait.disable();
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    // Check if there is a note present at the given coordinates
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

    // Add a new note to the list (from the menu)
    me.addNote = function () {
        var note = new Note({x: -boardX + 50, y: -boardY + 50});
        var data = {
            boardId: currentBoard.id,
            text: note.text,
            x: note.x,
            y: note.y,
            color: note.color
        };
        $.ajax({type: 'POST',
                url: notepanel.servicesUrl + '/notes',
                xhrFields: {withCredentials: true},
                dataType: 'json',
                data: JSON.stringify(data)})
            .done(function (data) {
            })
            .fail(notepanel.ajaxErrorHandler);
    };

    var adjustCanvas = function () {
        context.canvas.width  = window.innerWidth;
        context.canvas.height = window.innerHeight;
    };

    // Full redraw
    var draw = function () {
        adjustCanvas();
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        //drawBoard(context);
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

    // Draw one note
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

    Note.prototype.drawText = function(context) {
        var text = this.text;
        // x = this.x + left margin;
        var x = boardX + this.x + 10;
        // TODO : y (bottom) = this.y + menu.height + line.height
        var y = boardY + this.y + 10 + 15;
        // TODOD : width = this.width - (left margin + right margin)
        var width = this.width - (10 + 10);
        CanvasText.drawText({
            text: text,
            x: x,
            y: y,
            boxWidth: width
        });
    };

    Note.prototype.drawMenu = function(context) {
        var menu = new NoteMenu();
        this.menu = menu;
        menu.addItem(new NoteMenuItem("\uF00d"));
        var editItem = new NoteMenuItem("\uF040");
        $note = this;
        editItem.onClick = function() {
            notepanel.views.edit.enable(boardX, boardY, $note);
        }
        menu.addItem(editItem);
        // this logic should be in the note template
        context.font='14px "FontAwesome"';
        context.fillStyle = "#fff";
        context.textBaseline = 'bottom';
        context.textAlign = 'start';
        // TODO : manage template with menu starting either from left and right
        startX = boardX + this.x + this.width; // from right
        // menu starting from right
        for(i=0;i<menu.items.length;i++) {
            var item = menu.items[i];
            // TODO : set from template
            item.width = 16; //context.measureText(item.text); //14;
            menu.width += item.width;
        }
        menu.x = startX - menu.width;
        menu.items.reverse();
        // menu starting from left
        //startX = boardX + this.x
        //menu.x = startX
        // drawing menu from left
        menu.height = 16;
        menu.y = boardY + this.y; // from bottom
        for(i=0;i<menu.items.length;i++) {
            var item = menu.items[i];
            item.y = menu.y;
            item.height = menu.height;
            // TODO : set from template
            item.width = 16;//context.measureText(item.text); //14;
            item.x = menu.x + (i*item.width);
            context.fillText(item.text, item.x, item.y + menu.height);
        }
        this.menu = menu;
    };

    Note.prototype.isMouseOver = function(x, y) {
        return notepanel.utils.isInRectangle(x, y, boardX + this.x, boardY + this.y, this.width, this.height);
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
        return notepanel.utils.isInRectangle(x, y, this.x, this.y, this.width, this.height);
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
        return notepanel.utils.isInRectangle(x, y, this.x, this.y, this.width, this.height);
    };

    return me;
}(notepanel.views.panel || {});
