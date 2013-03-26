
notepanel.views.panel = function (me) {

    // Id and name of the displayed board
    var currentBoard = null;

    // Current version for synchronization
    var version = 0;

    // List of notes on the board
    var notes = [];

    // Dragging modes
    var modes = {
        STILL: 0,
        BOARD: 1,
        NOTE: 2,
        AWAIT_RESIZE: 3,
        RESIZE: 4
    };

    // user group of the current user
    var currentUserGroup = notepanel.enums.userGroups.VIEWER;

    // privacy of the current board
    var boardPrivacy = notepanel.enums.boardPrivacies.PUBLIC;

    var $canvas = null;

    // 2D drawing context
    var context = null;

    // Keep a reference to the running long polling xhr so we can abort it
    var currentPollXhr = null;

    // Current dragging mode
    var mode = modes.STILL;

    // Currently dragged note
    var movingNote = null;

    var resizingNote = null;
    
    // Currently hovered note
    var hoveredNote = null;

    // Loop timer so we can stop drawing during an update
    var currentTimer = null;

    // the border to move during a modes.RESIZE
    var resizeDirection = notepanel.notes.resizeZone.TOP;
    
    // Last mouse coordinates.
    var mouse = {
        x: 0,
        y: 0
    };

    me.lock = function () {
        mode === modes.STILL;
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

    me.open = function (callback) {
        callback(notepanel.template.templates.loadWindowPanel());
        $canvas = $('#canvas_board');
        context = $canvas.get(0).getContext('2d');
        adjustCanvas();
        notepanel.notes.adapter.scale.x = $canvas.width() / 2;
        notepanel.notes.adapter.scale.y = $canvas.height() / 2;
        me.unlock();
    };

    me.close = function () {
        //notepanel.menus.board.disactivate();
        interruptPolling();
        interruptDrawing();
    };

    var onMouseWheel = function (e, delta, deltaX, deltaY) {
        delta = -delta / 2;
        if ((delta < 0 && notepanel.notes.adapter.scale.ratio > 1) || (delta > 0 && notepanel.notes.adapter.scale.ratio < 4)) {
            notepanel.notes.adapter.scale.ratio += delta;
            for (var i = 0, imax = notes.length; i < imax; i++) {
                notes[i].relocate();
            }
        }
    };

    var onMouseMove = function (e) {
        var pt = {x: e.offsetX, y: e.offsetY};
        if (mode === modes.STILL) {
            hoveredNote = null;
            for (var i = notes.length - 1; i >= 0; i--) {
                var note = notes[i];
                if (hoveredNote === null && (note.isMouseOver(pt) || note.isMouseOverMenu(pt))) {
                    note.hovered = true;
                    hoveredNote = note;
                } else {
                    note.hovered = false;
                }
            }
            if (hoveredNote === null) {
                $canvas.css('cursor', 'default');
            } else {
                $canvas.css('cursor', 'pointer');
            }
        } else {
            $canvas.css('cursor', 'pointer');
            var mvmnt = {
                x: pt.x - mouse.x,
                y: pt.y - mouse.y
            };
            if (mode === modes.BOARD) {
                notepanel.notes.adapter.offset.x += mvmnt.x;
                notepanel.notes.adapter.offset.y += mvmnt.y;
                notepanel.notes.adapter.scale.x += mvmnt.x;
                notepanel.notes.adapter.scale.y += mvmnt.y;
                for (var i = 0, imax = notes.length; i < imax; i++) {
                    var note = notes[i];
                    note.location.x += mvmnt.x;
                    note.location.y += mvmnt.y;
                }
            } else if (mode === modes.NOTE) {
                movingNote.x += mvmnt.x * notepanel.notes.adapter.scale.ratio;
                movingNote.y += mvmnt.y * notepanel.notes.adapter.scale.ratio;
                movingNote.location.x += mvmnt.x;
                movingNote.location.y += mvmnt.y;
            } else if (mode === modes.RESIZE) {
                switch (resizeDirection) {
                    case notepanel.notes.resizeZone.TOP:
                        resizingNote.y += mvmnt.y;
                        resizingNote.height -= mvmnt.y;
                        break;
                    case notepanel.notes.resizeZone.RIGHT:
                        resizingNote.width += mvmnt.x;
                        break;
                    case notepanel.notes.resizeZone.BOTTOM:
                        resizingNote.height += mvmnt.y;
                        break;
                    case notepanel.notes.resizeZone.LEFT:
                        resizingNote.x += mvmnt.x;
                        resizingNote.width -= mvmnt.x;
                        break;
                }
                resizingNote.relocate();
            }
        }
        mouse.x = pt.x;
        mouse.y = pt.y;
    };
    
    var onMouseDown = function (e) {
        var pt = {x: e.offsetX, y: e.offsetY};
        var noteFound = false;
        var prevMode = mode;
        for (var i = notes.length - 1; i >= 0; i--) {
            var note = notes[i];
            if (note.isMouseOverMenu(pt)) {
                mode = modes.STILL;
                note.activateMenu(pt);
            } else if (note.isMouseOver(pt)) {
                if (mode === modes.AWAIT_RESIZE && note.resizing) {
                    mode = modes.RESIZE;
                    resizeDirection = note.getResizeZone(pt);
                } else {
                    mode = modes.NOTE;
                    note.moving = true;
                    movingNote = note;
                }
            } else {
                continue;
            }
            noteFound = true;
            moveNoteToTop(note.z);
            break;
        }
        if (!noteFound) {
            mode = modes.BOARD;
        }
        if (prevMode === modes.AWAIT_RESIZE && mode !== modes.RESIZE) {
            for (var i = 0, imax = notes.length; i < imax; i++) {
                if (notes[i].resizing) {
                    notes[i].resizing = false;
                    break;
                }
            }
            resizingNote = null;
        }
        return false;
    };

    var onMouseUp = function (e) {
        switch (mode) {
            case modes.RESIZE:
                mode = modes.AWAIT_RESIZE;
                break;
            case modes.NOTE:
                var data = {
                    id: movingNote.id,
                    x: movingNote.x,
                    y: movingNote.y,
                    z: movingNote.z,
                    width: movingNote.width,
                    height: movingNote.height,
                    update: notepanel.notes.updateType.POSITION
                };
                $.ajax({type: 'POST',
                        url: notepanel.servicesUrl + '/notes/' + movingNote.id,
                        xhrFields: {withCredentials: true},
                        dataType: 'json',
                        data: JSON.stringify(data)})
                    .fail(notepanel.globalErrorHandler);
                for (var i = 0, imax = notes.length; i < imax; i++) {
                    notes[i].moving = false;
                }
                movingNote = null;
                mode = modes.STILL;
                break;
            case modes.BOARD:
                mode = modes.STILL;
                break;
        }
        $canvas.css('cursor', 'default');
    };
    
    var moveNoteToTop = function (z) {
        var noteOnTheTop = notes.splice(z, 1)[0];
        notes.push(noteOnTheTop);
        setZNotes(0);
    };
    
    var setZNotes = function(startIndex) {
        for(var i=startIndex; i<notes.length; i++) {
            notes[i].z = i;
        }
    }

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
                url: notepanel.servicesUrl + '/notes/poll/' + version,
                xhrFields: {withCredentials: true},
                dataType: 'json'/*,timeout: 10000*/})
            .done(function (data, status, xhr) {
                // Ignore the response if it's from a previous, aborted ajax call
                if (xhr === currentPollXhr) {
                    var searchById = function (id) {
                        for (var i = notes.length - 1; i >= 0; i--) {
                            if (id === notes[i].id) {
                                return i;
                            }
                        }
                        throw 'sync error';
                    };
                    for (var j = 0, jmax = data.length; j < jmax; j++) {
                        var nt = data[j].note;
                        switch (nt.update) {
                            case notepanel.notes.updateType.ADD: {
                                var note = new notepanel.notes.Note(nt);
                                note.relocate();
                                var menuItems = [];
                                /*
                                if(note.options & notepanel.enums.noteOptions.EDITABLE) {
                                    menuItems.push(notepanel.notes.menuButtons.edit);
                                }
                                if(note.options & notepanel.enums.noteOptions.REMOVABLE) {
                                    menuItems.push(notepanel.notes.menuButtons.remove);
                                }
                                */
                                note.setMenuItems(menuItems);
                                note.setMenuItems([notepanel.notes.menuButtons.remove, notepanel.notes.menuButtons.edit, notepanel.notes.menuButtons.resize]);
                                notes.push(note);
                                break;
                            }
                            case notepanel.notes.updateType.REMOVE: {
                                var i = searchById(nt.id);
                                notes.splice(i, 1);
                                setZNotes(0); // recalculate z for notes
                                break;
                            }
                            case notepanel.notes.updateType.VALUE: {
                                var note = notes[searchById(nt.id)];
                                note.value = nt.value;
                                break;
                            }
                            case notepanel.notes.updateType.POSITION: {
                                var note = notes[searchById(nt.id)];
                                note.x = nt.x;
                                note.y = nt.y;
                                note.z = nt.z;
                                note.width = nt.width;
                                note.height = nt.height;
                                break;
                            }
                            case notepanel.notes.updateType.RIGHTS: {
                                var note = notes[searchById(nt.id)];
                                note.options = nt.options;
                                break;
                            }
                        }
                        // Double check in case they aren't ordered
                        version = data[j].version > version ? data[j].version : version;
                    }
                    currentPollXhr = null;
                    poll();
                }
            })
            .fail(function (xhr, status) {
                if (xhr === currentPollXhr) {
                    if (status === 'timeout') {
                        currentPollXhr = null;
                        poll();
                    } else {
                        notepanel.ajaxErrorHandler.apply(this, arguments);
                    }
                }
            });
    };

    // Set the currently open board
    me.setBoard = function (board, userGroup) {
        currentBoard = board;
        currentUserGroup = userGroup;
        if (board) {
            getBoardNotes();
        } else {
            // Clear panel.
            notes = [];
        }
    };

    me.getBoardId = function () {
        return currentBoard ? currentBoard.id : 0;
    };
    
    me.getBoard = function () {
        return currentBoard;
    };
    

    me.resize = function (note) {
        mode = modes.AWAIT_RESIZE;
        resizingNote = note;
    };

    // Refresh the current board's note list
    var getBoardNotes = function () {
        interruptPolling();
        interruptDrawing();
        notes.length = 0;
        $.ajax({type: 'GET',
                url: notepanel.servicesUrl + '/notes',
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {
                // Set notes
                for (var i = 0, imax = data.notes.length; i < imax; i++) {
                    var nt = new notepanel.notes.Note(data.notes[i]);
                    nt.relocate();
                    /* TODO 
                    var menuItems = [];
                    if(nt.options & notepanel.enums.noteOptions.EDITABLE) {
                        menuItems.push(notepanel.notes.menuButtons.edit);
                    }
                    if(nt.options & notepanel.enums.noteOptions.REMOVABLE) {
                        menuItems.push(notepanel.notes.menuButtons.remove);
                    }
                    nt.setMenuItems(menuItems);
                    */
                    nt.setMenuItems([notepanel.notes.menuButtons.remove, notepanel.notes.menuButtons.edit, notepanel.notes.menuButtons.resize]);
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
    me.addNote = function (designer) {

        var data = {
            update: notepanel.notes.updateType.ADD,
            boardId: currentBoard.id,
            userId: notepanel.user.id,
            value: {},
            width: 350,
            height: 250,
            x: 50,
            y: 50,
            z: notes.length,
            width: 350,
            height: 275,
            template: designer,
            defaultOptions: notepanel.enums.noteOptions.ALL,
            ownerOptions: notepanel.enums.noteOptions.ALL,
            adminOptions: notepanel.enums.noteOptions.ALL,
            contributorOptions: notepanel.enums.noteOptions.EDITABLE
        };

        $.ajax({type: 'PUT',
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

/*    
    // calculate note option for a user (logged or not) according to the board privacy
    var calculateBoardNoteOptions = function(note) {
        var options = 0;
        var user = notepanel.user;
        console.log(user);
        switch (boardPrivacy) {
            case notepanel.enums.boardPrivacies.PUBLIC:
                if(user) { // user is a user of this board
                    options = calculateNoteOptions(note);
                } else { // user is not a user of this board (logged or not)
                    options = notepanel.enums.noteOptions.NONE;
                }
                break;
            case notepanel.enums.boardPrivacies.INTERNAL_READONLY:
                if(user) { // user is a user of this board
                    options = calculateNoteOptions(note);
                } else { // user is not a user of this board (only logged)
                    options = notepanel.enums.noteOptions.NONE;
                }
                break;
            case notepanel.enums.boardPrivacies.INTERNAL_ALTERABLE:
                if(user) { // user is a user of this board
                    options = calculateNoteOptions(note);
                } else { // user is not a user of this board (only logged)
                    // note keep its default options
                    options = note.defaultOptions;
                }
                break;
            case notepanel.enums.boardPrivacies.PRIVATE:
                if(user) { // user is a user of this board
                    options = calculateNoteOptions(note);
                } else { // user is not a user of this board (only logged)
                    // note keep its default options
                    options = note.defaultOptions;
                }
                break;
            default:
                // TODO : throw exception ?
                options = notepanel.enums.noteOptions.NONE;
                break;
        }
        return options;
    }

    // calculate note option for a user
    var calculateNoteOptions = function(note) {
        var options = 0;
        console.log('user goup : ' + currentUserGroup);
        switch (currentUserGroup) {
            case notepanel.enums.userGroups.OWNER:
                console.log(" note.ownerOptions : " + note.ownerOptions);
                options = note.ownerOptions;
                console.log(" user is owner with options : " + options);
                break;
            case notepanel.enums.userGroups.ADMIN:
                options = note.adminOptions;
                break;
            case notepanel.enums.userGroups.CONTRIBUTOR:
                options = note.contributorOptions;
                break;
            case notepanel.enums.userGroups.VIEWER:
                options = notepanel.enums.noteOptions.NONE;
                break;
            default:
                // TODO : throw exception ?
                options = notepanel.enums.noteOptions.NONE;
                break;
        }
        if(note.lock && note.lock <= currentUserGroup) {// note is locked by a user with a higher or same profile (from 1 to 4, with 1 the highest) than the current user
            options = notepanel.enums.noteOptions.NONE;
        }
        return options;
    }
*/
    
    return me;
}(notepanel.views.panel || {});
