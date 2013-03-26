
notepanel.notes = {};

notepanel.notes.updateType = {
    ADD: 0,
    POSITION: 1,
    VALUE: 2,
    RIGHTS: 3,
    REMOVE: 4
};

notepanel.notes.editorType = {
    TEXTAREA: 0,
    COLORPICKER: 1
};

notepanel.notes.shapeType = {
    RECTANGLE: 0,
    PHOTO: 1
};

notepanel.notes.resizeZone = {
    TOP: 0,
    RIGHT: 1,
    BOTTOM: 2,
    LEFT: 3
};

notepanel.notes.adapter = {
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

notepanel.notes.menuButtons = {
    remove: {
        text: '\uF00D',
        width: 16,
        height: 16,
        onClick: function () {
            this.remove();
        }
    },
    edit: {
        text: '\uF040',
        width: 16,
        height: 16,
        onClick: function () {
            notepanel.views.panel.lock();
            notepanel.views.edit.enable(this);
        }
    },
    resize: {
        text: '\uF065',
        width: 16,
        height: 16,
        onClick: function () {
            notepanel.views.panel.resize(this);
            this.resizing = true;
        }
    }
};

notepanel.notes.designers = {
    'default': {
        title: 'Simple note',
        shapes: [
            // Base.
            {
                type: notepanel.notes.shapeType.RECTANGLE,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                stroke: 0xA0A0A0,
                fill: {
                    type: notepanel.notes.editorType.COLORPICKER,
                    title: 'Background color',
                    name: 'color',
                    def: 0xFFFFFF,
                },
                base: true
            },
            // Text padding.
            {
                type: notepanel.notes.shapeType.RECTANGLE,
                x: 4,
                y: 4,
                width: 92,
                height: 92,
                text: {
                    type: notepanel.notes.editorType.TEXTAREA,
                    title: 'Note text',
                    name: 'contents'
                }
            }
        ]
    },
    'polaroid': {
        title: 'Note with photo',
        shapes: [
            {
                type: notepanel.notes.shapeType.RECTANGLE,
                x: 0,
                y: 0,
                width: 100,
                height: 100,
                fill: 0xFFFFFF,
                stroke: 0xC0C0C0,
                base: true
            },
            {
                type: notepanel.notes.shapeType.PHOTO,
                x: 10,
                y: 10,
                width: 80,
                height: 60,
                url: {
                    type: notepanel.notes.editorType.TEXTAREA,
                    title: 'Image URL',
                    name: 'imageUrl'
                }
            },
            {
                type: notepanel.notes.shapeType.RECTANGLE,
                x: 10,
                y: 80,
                width: 80,
                height: 80,
                text: {
                    type: notepanel.notes.editorType.TEXTAREA,
                    title: 'Legend',
                    name: 'legend',
                    max: 20
                }
            }
        ]
    }
};

notepanel.notes.Note = function (options) {
    this.id = null;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.width = 350;
    this.height = 275;
    this.value = {};
    this.template = 'default';
    //this.options = notepanel.enums.noteOptions.NONE;
    this.menu = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        items: []
    };
    this.location = {
        x: 0,
        y: 0
    };
    $.extend(this, options);
};

// Adjust node screen relative location based on zoom and board offset.
notepanel.notes.Note.prototype.relocate = function () {
    var pt = notepanel.notes.adapter.move.call(notepanel.notes.adapter, this);
    this.location.x = pt.x;
    this.location.y = pt.y;
    var dim = notepanel.notes.adapter.resize.call(notepanel.notes.adapter, this);
    this.location.width = dim.width;
    this.location.height = dim.height;
};

notepanel.notes.Note.prototype.setMenuItems = function (items) {
    this.menu.items = items;
    for (var i = 0, imax = items.length; i < imax; i++) {
        var item = items[i];
        this.menu.width += item.width;
        this.menu.height = item.height > this.menu.height ? item.height : this.menu.height;
    }
};

notepanel.notes.Note.prototype.remove = function() {
    $.ajax({type: 'DELETE',
            url: notepanel.servicesUrl + '/notes/' + this.id,
            xhrFields: {withCredentials: true},
            dataType: 'json'})
        .fail(notepanel.globalErrorHandler);
};

// Cache for images displayed in notes
notepanel.notes.imageCache = {};

notepanel.notes.movingElev = 12;
notepanel.notes.baseElev = 4;

notepanel.notes.Note.prototype.draw = function (ctx) {

    var shapes = notepanel.notes.designers[this.template].shapes;

    var movingElev = this.scale(notepanel.notes.movingElev);
    var baseElev = this.scale(notepanel.notes.baseElev);

    for (var i = 0, imax = shapes.length; i < imax; i++) {

        var shape = shapes[i];

        if (shape.type === notepanel.notes.shapeType.RECTANGLE
                || shape.type === notepanel.notes.shapeType.PHOTO) {

            var x = this.location.x + (this.location.width * shape.x / 100);
            var w = (this.location.width * shape.width / 100);
            var y = this.location.y + (this.location.height * shape.y / 100);
            var h = (this.location.height * shape.height / 100);

            if (this.moving) {
                x -= movingElev;
                y -= movingElev;
            }

            if (shape.base) {
                var dist = baseElev;
                if (this.moving) {
                    dist += movingElev;
                }
                notepanel.drawing.drawRectangle(ctx, x + dist, y + dist, w + dist, h + dist);
                ctx.fillStyle = notepanel.colors.toCssString({r: 0, g: 0, b: 0, a: 64});
                ctx.fill();
            }

            notepanel.drawing.drawRectangle(ctx, x, y, w, h);
        }

        if ('stroke' in shape) {
            var col = null;
            switch (typeof shape.stroke) {
                case 'object':
                    if (typeof this.value[shape.stroke.name] === 'number') {
                        col = this.value[shape.stroke.name];
                    } else if (typeof shape.stroke.def === 'number') {
                        col = shape.stroke.def;
                    }
                    break;
                case 'number':
                    col = shape.stroke;
                    break;
            }
            if (col) {
                var c = notepanel.colors.fromRgbInt(col);
                if (this.hovered) {
                    notepanel.colors.darken(c, 64);
                }
                if (shape.base && this.resizing) {
                    ctx.lineWidth = 8;
                }
                ctx.strokeStyle = notepanel.colors.toCssString(c);
                ctx.stroke();
                if (shape.base && this.resizing) {
                    ctx.lineWidth = 1;
                }
            }
        }

        if ('fill' in shape) {
            var col = null;
            switch (typeof shape.fill) {
                case 'object':
                    if (typeof this.value[shape.fill.name] === 'number') {
                        col = this.value[shape.fill.name];
                    } else if (typeof shape.fill.def === 'number') {
                        col = shape.fill.def;
                    }
                    break;
                case 'number':
                    col = shape.fill;
                    break;
            }
            if (col) {
                var c = notepanel.colors.fromRgbInt(col);
                if (this.hovered) {
                    notepanel.colors.lighten(c, 16);
                }
                ctx.fillStyle = notepanel.colors.toCssString(c);
                ctx.fill();
            }
        }

        if (shape.type === notepanel.notes.shapeType.PHOTO) {
            var url;
            switch (typeof shape.url) {
                case 'object':
                    if (typeof this.value[shape.url.name] === 'string') {
                        url = this.value[shape.url.name];
                    }
                    break;
                case 'string':
                    url = shape.url;
                    break;
            }
            if (url) {
                if (url in notepanel.notes.imageCache) {
                    if (notepanel.notes.imageCache[url].loaded) {
                        ctx.drawImage(notepanel.notes.imageCache[url].image, x, y, w, h);
                    }
                } else {
                    var img = new Image();
                    notepanel.notes.imageCache[url] = {
                        loaded: false,
                        image: img
                    }
                    img.onload = function () {
                        notepanel.notes.imageCache[url].loaded = true;
                    };
                    img.src = url;
                }
            }
        }

        if ('text' in shape) {
            var lh = this.scale(32);
            notepanel.template.canvasText.lineHeight = lh + 'px';
            notepanel.template.canvasText.fontSize = this.scale(36) + 'px';
            var options = {
                x: x,
                y: y + lh,
                boxWidth: w
            };
            switch (typeof shape.text) {
                case 'object':
                    if (typeof this.value[shape.text.name] === 'string') {
                        options.text = this.value[shape.text.name];
                    }
                    break;
                case 'string':
                    options.text = shape.text;
                    break;
            }
            if (options.text) {
                notepanel.template.canvasText.drawText(options);
            }
        }
    }

    if (this.hovered) {

        var pad = 4;

        this.menu.x = this.location.x + this.location.width - this.menu.width / 2;

        if (this.moving) {
            this.menu.x -= movingElev;
        }

        this.menu.y = this.location.y - this.menu.height / 2;

        if (this.moving) {
            this.menu.y -= movingElev;
        }

        // Menu box.

        notepanel.drawing.drawRectangleRounded(ctx,
            this.menu.x - pad, this.menu.y - pad, this.menu.width + 2 * pad, this.menu.height + 2 * pad, 4);
        ctx.fillStyle = notepanel.colors.toCssString({r: 255, g: 255, b: 255, a: 128});
        ctx.fill();
        ctx.strokeStyle = notepanel.colors.toCssString({r: 64, g: 64, b: 64, a: 255});
        ctx.stroke();

        // Menu text.

        ctx.font = '14 px "FontAwesome"';
        ctx.fillStyle = "#000000";
        ctx.textBaseline = 'bottom';
        ctx.textAlign = 'start';

        for (var i = 0, imax = this.menu.items.length; i < imax; i++) {
            var item = this.menu.items[i];
            item.y = this.menu.y;
            item.x = this.menu.x + (i * item.width);
            ctx.fillText(item.text, item.x, item.y + this.menu.height);
        }
    }
};

notepanel.notes.Note.prototype.isMouseOverMenu = function (pt) {
    return notepanel.utils.isInRectangle(pt, this.menu);
};

notepanel.notes.Note.prototype.isMouseOver = function (pt) {
    return notepanel.utils.isInRectangle(pt, this.location);
};


// return the closest border as a notepanel.notes.resizeZone
notepanel.notes.Note.prototype.getResizeZone = function (pt) {
    var d = function (a, b) {
        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    };
    var m = [
        {x: this.location.x + this.location.width / 2, y: this.location.y},
        {x: this.location.x + this.location.width, y: this.location.y + this.location.height / 2},
        {x: this.location.x + this.location.width / 2, y: this.location.y + this.location.height},
        {x: this.location.x, y: this.location.y + this.location.height / 2}
    ];
    var v = Number.MAX_VALUE;
    var n = 0;
    for (var i = 0; i < 4; i++) {
        var u = d(pt, m[i]);
        if (u < v) {
            v = u;
            n = i;
        }
    }
    return n;
};

notepanel.notes.Note.prototype.scale = function (len) {
    return len / notepanel.notes.adapter.scale.ratio;
};

notepanel.notes.Note.prototype.activateMenu = function (pt) {
    //if (notepanel.utils.isInRectangle(pt, this.menu)) {
        for (var i = 0, imax = this.menu.items.length; i < imax; i++) {
            var item = this.menu.items[i];
            if (notepanel.utils.isInRectangle(pt, item)) {
                item.onClick.apply(this);
                break;
                //return true;
            }
        }
    //}
    //return false;
};
