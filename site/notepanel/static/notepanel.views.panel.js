
notepanel.views.panel = function (me) {

    // Id and name of the displayed board
    var currentBoard = null;

    // Current version for synchronization
    var version = 0;

    // List of notes on the board
    var notes = [];

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

    // Currently hovered note
    var hoveredNote = null;

    // Loop timer so we can stop drawing during an update
    var currentTimer = null;

    var adapter = {
        // Keep track of all the transforms on the canvas.
        trnsfrm: new Transform(),
        offset: {
            x: 0,
            y: 0
        },
        // Zooming.
        scale: {
            ratio: 1,
            x: 0,
            y: 0
        }
    };

    // Last mouse coordinates.
    var mouse = {
        x: 0,
        y: 0
    };

    var enabled = false;

    $(document).ready(function () {
        $canvas = $('#canvas_board');
        context = $canvas.get(0).getContext('2d');
        adjustCanvas();
        $('#div_panel').hide();
    });

    me.lock = function () {
        mode === modes.still;
        $canvas.off('mousedown');
        $canvas.off('mousemove');
        $canvas.off('mouseup');
        $canvas.off('mousewheel');
    };

    me.unlock = function () {
        $canvas.on('mousedown', onMouseDown);
        $canvas.on('mousemove', onMouseMove);
        $canvas.on('mouseup', onMouseUp);
        $canvas.on('mousewheel', onMouseWheel);
    };

    // Enable this view
    me.enable = function () {
        if (!enabled) {
            me.unlock();
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
            me.lock();
            $('#div_panel').hide();
            interruptPolling();
            interruptDrawing();
            enabled = false;
        }
    };

    var onMouseWheel = function (e, delta, deltaX, deltaY) {
        var sc = adapter.scale;
        var st = adapter.trnsfrm;
        var pt = adapter.trnsfrm.transformPoint({x: e.offsetX, y: e.offsetY});
        //var pt = {x: e.offsetX, y: e.offsetY};
        var zoom = Math.pow(Math.abs(delta) / 16 + 1, delta);
        var rescale = sc.ratio * zoom;
        //adapter.offset.x += sc.x;
        //adapter.offset.y += sc.y;
        
        sc.ratio = rescale;
        
        /*
        st.translate(sc.x, sc.y);
        st.scale(zoom, zoom);
        sc.x += pt.x / sc.ratio - pt.x / rescale;
        sc.y += pt.y / sc.ratio - pt.y / rescale;
        st.translate(-sc.x, -sc.y);
        sc.ratio = rescale;
        context.setTransform.apply(context, st.m);
        */
    };

    var onMouseMove = function (e) {
        //var pt = adapter.trnsfrm.transformPoint({x: e.offsetX, y: e.offsetY});
        var pt = {x: e.offsetX, y: e.offsetY};
        if (mode !== modes.still) {
            $canvas.css('cursor', 'pointer');
            var mvmnt = {
                x: (pt.x - mouse.x) / adapter.scale.ratio,
                y: (pt.y - mouse.y) / adapter.scale.ratio
            };
            if (mode === modes.board) {
                //adapter.trnsfrm.translate(mvmnt.x, mvmnt.y);
                //context.setTransform.apply(context, adapter.trnsfrm.m);
                //context.translate(mvmnt.x, mvmnt.y);
                adapter.offset.x += mvmnt.x;
                adapter.offset.y += mvmnt.y;
            } else if (mode === modes.note) {
                movingNote.x += mvmnt.x;
                movingNote.y += mvmnt.y;
            }
        } else {
            hoveredNote = null;
            for (var i = 0, imax = notes.length; i < imax; i++) {
                var note = notes[i];
                note.hovered = false;
                if (hoveredNote === null && note.isMouseOver(pt)) {
                    note.hovered = true;
                    hoveredNote = note;
                }
            }
            if (hoveredNote === null) {
                $canvas.css('cursor', 'default');
            } else {
                $canvas.css('cursor', 'pointer');
            }
        }
        mouse.x = pt.x;
        mouse.y = pt.y;
    };
    
    
    var moveNoteToTop = function (z) {
        var noteOnTheTop = notes.splice(z, 1)[0];
        notes.push(noteOnTheTop);
        for(var i=z; i<notes.length; i++) {
            var note = notes[i];
            note.z = i;
        }
    };

    var onMouseDown = function (e) {
        //var pt = adapter.trnsfrm.transformPoint({x: e.offsetX, y: e.offsetY});
        var pt = {x: e.offsetX, y: e.offsetY};
        mode = modes.board;
        for (var i = notes.length - 1; i >= 0; i--) {
            var note = notes[i];
            note.moving = false;
            if (note.isMouseOver(pt)) {
                // set the moving note on the top
                moveNoteToTop(note.z);
                if (note.activateMenu(pt)) {
                    mode = modes.still;
                } else {
                    mode = modes.note;
                    note.moving = true;
                    movingNote = note;
                }
            }
        }
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
            
            for (var i = 0, imax = notes.length; i < imax; i++) {
                var note = notes[i];
                note.moving = false;
            }

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
                        for (var i = notes.length - 1; i >= 0; i--) {
                            if (data[j].note.id === notes[i].id) {
                                if (data[j].note.deleted) {
                                    notes.splice(i, 1);
                                } else {
                                    // Copy all the new properties
                                    notes[i].text = data[j].note.text;
                                    notes[i].color = data[j].note.color;
                                    notes[i].x = data[j].note.x;
                                    notes[i].y = data[j].note.y;
                                }
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            var nt = new notepanel.notes.Note(data[j].note);
                            nt.adapter = adapter;
                            nt.setMenuItems([notepanel.notes.menuButtons.remove, notepanel.notes.menuButtons.edit]);
                            notes.push(nt);
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
                    var nt = new notepanel.notes.Note(data.notes[i]);
                    nt.adapter = adapter;
                    nt.setMenuItems([notepanel.notes.menuButtons.remove, notepanel.notes.menuButtons.edit]);
                    notes.push(nt);
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

    // Add a new note to the list (from the menu)
    me.addNote = function () {
        var nt = new notepanel.notes.Note({x: 50, y: 50});
        var data = {
            boardId: currentBoard.id,
            text: nt.text,
            x: nt.x,
            y: nt.y,
            z: notes.length-1,
            color: nt.color
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
        if (context.canvas.width != window.innerWidth || context.canvas.height != window.innerHeight) {
            context.canvas.width  = window.innerWidth;
            context.canvas.height = window.innerHeight;
        }
    };

    // Full redraw
    var draw = function () {
        context.save();
        adjustCanvas();
        //context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
        //drawBoard(context);
        drawNotes(context);
    };

    // Draw each note in the list
    var drawNotes = function (context) {
        for (var i = 0, imax = notes.length; i < imax; i++) {
            notes[i].draw(context);
        }
        if (hoveredNote === null) {
            $canvas.css('cursor', 'default');
        } else {
            $canvas.css('cursor', 'pointer');
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
        this.z = 0;
        this.width = 175;
        this.height = 100;
        this.text = 'new sticky note';
        this.color = '66aaee';
        this.template = 'default';
        this.menu = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            items: []
        };
        // merge options in Note
        $.extend(this, options);
    };

    Note.prototype.setMenuItems = function (items) {
        this.menu.items = items;
        for (var i = 0, imax = items.length; i < imax; i++) {
            var item = items[i];
            this.menu.width += item.width;
            this.menu.height = item.height > this.menu.height ? item.height : this.menu.height;
        }
    };

    Note.prototype.drawText = function (context) {
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

    Note.prototype.remove = function() {
        $.ajax({type: 'DELETE',
                url: notepanel.servicesUrl + '/notes?noteId=' + this.id + '&boardId=' + this.boardId,
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .fail(notepanel.globalErrorHandler);
    };

    Note.prototype.draw = function (context) {
        context.beginPath();
        context.moveTo(this.x + boardX, this.y + boardY);
        context.lineTo(this.x + noteWidth + boardX, this.y + boardY);
        context.lineTo(this.x + noteWidth + boardX, this.y + noteHeight + boardY);
        context.lineTo(this.x + boardX, this.y + noteHeight + boardY);
        context.closePath();
        if (mode === modes.note && this === movingNote) {
            context.strokeStyle = '#444444';
            context.fillStyle = '#' + this.color;
        } else {
            context.strokeStyle = '#888888';
            context.fillStyle = '#' + this.color;
        }
        context.stroke();
        context.fill();
        // draw note text
        this.drawText(context);
        // draw note menu
        if (hoveredNote === this) {
            // draw note menu on the hovered note
            this.drawMenu(context);
        }
    };

    Note.prototype.drawMenu = function (context) {
        // this logic should be in the note template
        context.font='14px "FontAwesome"';
        context.fillStyle = "#fff";
        context.textBaseline = 'bottom';
        context.textAlign = 'start';
        // TODO : manage template with menu starting either from left and right
        var startX = boardX + this.x + this.width; // from right
        this.menu.x = startX - this.menu.width;
        //this.menu.items.reverse();
        // menu starting from left
        //startX = boardX + this.x
        //menu.x = startX
        // drawing menu from left
        this.menu.y = boardY + this.y; // from bottom
        for (var i = 0, imax = this.menu.items.length; i < imax; i++) {
            var item = this.menu.items[i];
            item.y = this.menu.y;
            item.x = this.menu.x + (i * item.width);
            context.fillText(item.text, item.x, item.y + this.menu.height);
        }
    };

    Note.prototype.isMouseOver = function(x, y) {
        return notepanel.utils.isInRectangle(x, y, {x: boardX + this.x, y: boardY + this.y, width: this.width, height: this.height});
    };

    Note.prototype.activateMenu = function (x, y) {
        if (notepanel.utils.isInRectangle(x, y, this.menu)) {
            for (var i = 0, imax = this.menu.items.length; i < imax; i++) {
                var item = this.menu.items[i];
                if (notepanel.utils.isInRectangle(x, y, item)) {
                    item.onClick.apply(this);
                    return true;
                }
            }
        }
        return false;
    };

    return me;
}(notepanel.views.panel || {});
