
notepanel.notes = {};

notepanel.notes.menuButtons = {
    remove: {
        text: '\uF00d',
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
    }
};

notepanel.notes.designers = {
    'default': {
        draw: function (ctx) {
            ctx.beginPath();
            ctx.moveTo(this.location.x, this.location.y);
            ctx.lineTo(this.location.x + this.location.width, this.location.y);
            ctx.lineTo(this.location.x + this.location.width, this.location.y + this.location.height);
            ctx.lineTo(this.location.x, this.location.y + this.location.height);
            ctx.closePath();
            if (this.moving) {
                ctx.strokeStyle = '#202020';
            } else {
                ctx.strokeStyle = '#A0A0A0';
            }
            if (this.hovered) {
                var col = notepanel.colors.parse(this.color);
                notepanel.colors.lighten(col, 0x10);
                var c = notepanel.colors.toString(col, notepanel.colors.type.rgb);
                ctx.fillStyle = '#' + c;
            } else {
                ctx.fillStyle = '#' + this.color;
            }
            ctx.stroke();
            ctx.fill();

            // Shadow.
            ctx.beginPath();
            ctx.moveTo(this.location.x + this.location.width, this.location.y + 4);
            ctx.lineTo(this.location.x + this.location.width + 4, this.location.y + 4);
            ctx.lineTo(this.location.x + this.location.width + 4, this.location.y + this.location.height + 4);
            ctx.lineTo(this.location.x + 4, this.location.y + this.location.height + 4);
            ctx.lineTo(this.location.x + 4, this.location.y + this.location.height);
            ctx.lineTo(this.location.x + this.location.width, this.location.y + this.location.height);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.fill();

            // draw note menu
            if (this.hovered) {
                // draw note menu on the hovered note
                ctx.font = '14 px "FontAwesome"';
                ctx.fillStyle = "#fff";
                ctx.textBaseline = 'bottom';
                ctx.textAlign = 'start';
                // TODO : manage template with menu starting either from left and right
                var startX = this.location.x + this.location.width; // from right
                this.menu.x = startX - this.menu.width;
                //this.menu.items.reverse();
                // menu starting from left
                //startX = boardX + this.x
                //menu.x = startX
                // drawing menu from left
                this.menu.y = this.location.y;
                for (var i = 0, imax = this.menu.items.length; i < imax; i++) {
                    var item = this.menu.items[i];
                    item.y = this.menu.y;
                    item.x = this.menu.x + (i * item.width);
                    ctx.fillText(item.text, item.x, item.y + this.menu.height);
                }
            }
            // draw note text
            notepanel.template.canvasText.fontSize = this.scale(36) + 'px';
            notepanel.template.canvasText.drawText({
                text: this.text,
                x: this.location.x + this.scale(10),
                y: this.location.y + this.menu.height + parseInt(notepanel.template.canvasText.lineHeight),
                boxWidth: this.location.width - (this.scale(10) + this.scale(10))
            });
        }
    }
};

notepanel.notes.Note = function (options) {
    this.id = null;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.width = 350;
    this.height = 275;
    this.text = 'new sticky note';
    this.color = '66aaee';
    this.template = 'default';
    this.options = notepanel.enums.noteOptions.NONE;
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
    this.adapter = null;
    $.extend(this, options);
};

notepanel.notes.Note.prototype.relocate = function () {
    var pt = this.adapter.move.call(this.adapter, this);
    this.location.x = pt.x;
    this.location.y = pt.y;
    var dim = this.adapter.resize.call(this.adapter, this);
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
            url: notepanel.servicesUrl + '/notes?noteId=' + this.id + '&boardId=' + this.boardId,
            xhrFields: {withCredentials: true},
            dataType: 'json'})
        .fail(notepanel.globalErrorHandler);
};

notepanel.notes.Note.prototype.draw = function (ctx) {
    notepanel.notes.designers[this.template].draw.call(this, ctx);
};

notepanel.notes.Note.prototype.isMouseOver = function (pt) {
    return notepanel.utils.isInRectangle(pt, this.location);
};

notepanel.notes.Note.prototype.scale = function (len) {
    return len / this.adapter.scale.ratio;
};

notepanel.notes.Note.prototype.activateMenu = function (pt) {
    if (notepanel.utils.isInRectangle(pt, this.menu)) {
        for (var i = 0, imax = this.menu.items.length; i < imax; i++) {
            var item = this.menu.items[i];
            if (notepanel.utils.isInRectangle(pt, item)) {
                item.onClick.apply(this);
                return true;
            }
        }
    }
    return false;
};
