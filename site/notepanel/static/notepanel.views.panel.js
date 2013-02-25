
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
    var mode = modes.still;

    // Currently dragged note
    var movingNote = null;

    // Currently hovered note
    var hoveredNote = null;

    // Loop timer so we can stop drawing during an update
    var currentTimer = null;

    var adapter = {
        scale: {
            ratio: 1,
            x: 0,
            y: 0
        },
        offset: {
            x: 0,
            y: 0
        },
        move: function (pt) {
            return {
                x: this.scale.x + ((pt.x + this.offset.x - this.scale.x) / this.scale.ratio),
                y: this.scale.y + ((pt.y + this.offset.y - this.scale.y) / this.scale.ratio)
            };
        },
        resize: function (dim) {
            return {
                width: dim.width / this.scale.ratio,
                height: dim.height / this.scale.ratio
            };
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
        adapter.scale.x = $canvas.width() / 2;
        adapter.scale.y = $canvas.height() / 2;
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
        delta = -delta / 2;
        if ((delta < 0 && adapter.scale.ratio > 1) || (delta > 0 && adapter.scale.ratio < 4)) {
            adapter.scale.ratio += delta;
            for (var i = 0, imax = notes.length; i < imax; i++) {
                notes[i].relocate();
            }
        }
    };

    var onMouseMove = function (e) {
        var pt = {x: e.offsetX, y: e.offsetY};
        if (mode !== modes.still) {
            $canvas.css('cursor', 'pointer');
            var mvmnt = {
                x: pt.x - mouse.x,
                y: pt.y - mouse.y
            };
            if (mode === modes.board) {
                adapter.offset.x += mvmnt.x;
                adapter.offset.y += mvmnt.y;
                adapter.scale.x += mvmnt.x;
                adapter.scale.y += mvmnt.y;
                for (var i = 0, imax = notes.length; i < imax; i++) {
                    var note = notes[i];
                    note.location.x += mvmnt.x;
                    note.location.y += mvmnt.y;
                }
            } else if (mode === modes.note) {
                movingNote.x += mvmnt.x * adapter.scale.ratio;
                movingNote.y += mvmnt.y * adapter.scale.ratio;
                movingNote.location.x += mvmnt.x;
                movingNote.location.y += mvmnt.y;
            }
        } else {
            hoveredNote = null;
            for (var i = notes.length - 1; i >= 0; i--) {
                var note = notes[i];
                if (hoveredNote === null && note.isMouseOver(pt)) {
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
        }
        mouse.x = pt.x;
        mouse.y = pt.y;
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

    var onMouseDown = function (e) {
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
                break;
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
                z: movingNote.z,
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
                                    setZNotes(0); // recalculate z for notes
                                } else {
                                    // Copy all the new properties
                                    notes[i].text = data[j].note.text;
                                    notes[i].color = data[j].note.color;
                                    notes[i].x = data[j].note.x;
                                    notes[i].y = data[j].note.y;
                                    notes[i].z = data[j].note.z;
                                    notes[i].options = data[j].note.options;
                                    console.log("on poll, options for note " + notes[i].id + " : " + notes[i].options);
                                }
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            var nt = new notepanel.notes.Note(data[j].note);
                            nt.adapter = adapter;
                            nt.relocate();
                            var menuItems = [];
                            if(nt.options & notepanel.enums.noteOptions.EDITABLE) {
                                menuItems.push(notepanel.notes.menuButtons.edit);
                            }
                            if(nt.options & notepanel.enums.noteOptions.REMOVABLE) {
                                menuItems.push(notepanel.notes.menuButtons.remove);
                            }
                            nt.setMenuItems(menuItems);
                            //nt.setMenuItems([notepanel.notes.menuButtons.remove, notepanel.notes.menuButtons.edit]);
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
    me.setBoard = function (board, userGroup) {
        currentBoard = board;
        currentUserGroup = userGroup;
        if(board) {
            getBoardNotes();
        } else {
            notes = []; // clear panel
        }
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
                url: notepanel.servicesUrl + '/notes?boardId=' + me.getBoardId(),
                xhrFields: {withCredentials: true},
                dataType: 'json'})
            .done(function (data) {
                // Set notes
                for (var i = 0, imax = data.notes.length; i < imax; i++) {
                    var nt = new notepanel.notes.Note(data.notes[i]);
                    nt.adapter = adapter;
                    nt.relocate();
                    /* TODO */
                    var menuItems = [];
                    if(nt.options & notepanel.enums.noteOptions.EDITABLE) {
                        menuItems.push(notepanel.notes.menuButtons.edit);
                    }
                    if(nt.options & notepanel.enums.noteOptions.REMOVABLE) {
                        menuItems.push(notepanel.notes.menuButtons.remove);
                    }
                    nt.setMenuItems(menuItems);
                    
                    //nt.setMenuItems([notepanel.notes.menuButtons.remove, notepanel.notes.menuButtons.edit]);
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
        nt.defaultOptions = notepanel.enums.noteOptions.ALL;
        nt.ownerOptions = notepanel.enums.noteOptions.ALL;
        nt.adminOptions = notepanel.enums.noteOptions.ALL;
        nt.contributorOptions = notepanel.enums.noteOptions.EDITABLE;
        
        var data = {
            boardId: currentBoard.id,
            userId: notepanel.user.id,
            text: nt.text,
            width: nt.width,
            height: nt.height,
            x: nt.x,
            y: nt.y,
            z: notes.length,
            color: nt.color,
            template: nt.template,
            defaultOptions: nt.defaultOptions,
            ownerOptions: nt.ownerOptions,
            adminOptions: nt.adminOptions,
            contributorOptions: nt.contributorOptions
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
