
notepanel.windowManager = function (me) {
    var currentWindow = null;
    var currentDialog = null;
    var menuAnimDuration = 200;
    
    me.menus = null;
    me.dialogs = null;
    
    me.menuPositions = {
        TOP: 'top',
        BOTTOM: 'bottom',
        LEFT: 'left',
        RIGHT: 'right'
    };

    var menuSettings = {
        top: {
            initCss: function () {
                this.$container.css({top: '0px', left: '0px', right: '0px'});
            },
            enter: function (e) {
                return e.clientY < 20;
            },
            leave: function (e) {
                var h = this.$container.outerHeight(true);
                return e.clientY > h + 10;
            },
            slideIn: function () {
                this.$container.clearQueue().animate({top: '0px'}, menuAnimDuration);
            },
            slideOut: function () {
                this.$container.clearQueue().animate({top: '-' + this.$container.outerHeight(true) + 'px'}, menuAnimDuration);
            }
        },
        bottom: {
            initCss: function () {
                this.$container.css({bottom: '0px', left: '0px', right: '0px'});
            },
            enter: function (e) {
                return e.clientY > window.innerHeight - 20;
            },
            leave: function (e) {
                return e.clientY < window.innerHeight - 10 - this.$container.outerHeight();
            },
            slideIn: function () {
                this.$container.clearQueue().animate({bottom: window.innerHeight + 'px'}, menuAnimDuration);
            },
            slideOut: function () {
                this.$container.clearQueue().animate({bottom: '-' + (window.innerHeight - this.$container.outerHeight()) + 'px'}, menuAnimDuration);
            }
        },
        left: {
            initCss: function () {
                this.$container.css({top: '0px', bottom: '0px', left: '0px'});
            },
            enter: function (e) {
                return e.clientX < 20;
            },
            leave: function (e) {
                return e.clientX > this.$container.outerWidth() + 10;
            },
            slideIn: function () {

            },
            slideOut: function () {

            }
        },
        right: {
            initCss: function () {
                this.$container.css({top: '0px', bottom: '0px', right: '0px'});
            },
            enter: function (e) {
                return e.clientX > window.innerWidth - 20;
            },
            leave: function (e) {
                return e.clientX < window.innerWidth - 10 - this.$container.outerWidth();
            },
            slideIn: function () {
                this.$container.clearQueue().animate({left: (window.innerWidth - this.$container.outerWidth()) + 'px'}, menuAnimDuration);
            },
            slideOut: function () {
                this.$container.clearQueue().animate({left: window.innerWidth + 'px'}, menuAnimDuration);
            }
        }
    }

    me.init = function () {
        for (var n in me.menus) {
            (function (menu) {
                var settings = menuSettings[menu.position];
                menu.enabled = false;
                $(document).ready(function () {
                    menu.$container = $(menu.container);
                    menu.$container.css({position: 'absolute'});
                    settings.initCss.call(menu);
                });
                if (menu.hide) {
                    menu.locked = false;
                    $(document).ready(function () {
                        settings.slideOut.call(menu);
                    });
                    $(window).on('mousemove.windowManager', function (e) {
                        if (!menu.locked && !menu.sysLocked) {
                            if (!menu.enabled && settings.enter.call(menu, e)) {
                                me.showMenu(menu);
                            } else if (menu.enabled && settings.leave.call(menu, e)) {
                                me.hideMenu(menu);
                            }
                        }
                    });
                }
            })(me.menus[n]);
        }
        for (var n in me.dialogs) {
            var dialog = me.dialogs[n];
            dialog.$container = $(dialog.container);
            dialog.$container.hide();
        }
    };

    me.showMenu = function (menu) {
        menu.enabled = true;
        if (menu.enable) {
            menu.enable.call(menu);
        }
        menuSettings[menu.position].slideIn.call(menu);
    };

    me.hideMenu = function (menu) {
        menu.enabled = false;
        if (menu.disable) {
            menu.disable.call(menu);
        }
        menuSettings[menu.position].slideOut.call(menu);
    };

    var lockMenus = function () {
        changeLockMenus(true);
    };

    var unlockMenus = function () {
        changeLockMenus(false);
    };

    var changeLockMenus  = function (state) {
        for (var n in me.menus) {
            // Lock distinct from regular one so it can be reverted.
            me.menus[n].sysLocked = state;
        }
    };

    me.openDialog = function (dialog) {
        if (currentDialog) {
            if (currentDialog.disable) {
                currentDialog.disable.call(currentDialog);
            }
            currentDialog.$container.hide();
        } else {
            lockMenus();
        }
        currentDialog = dialog;
        currentDialog.$container.show();
        if (dialog.enable) {
            dialog.enable.call(dialog);
        }
    };

    me.closeDialog = function () {
        if (currentDialog) {
            currentDialog.$container.hide();
            if (currentDialog.disable) {
                currentDialog.disable.call(currentDialog);
            }
            currentDialog = null;
            unlockMenus();
        }
    };

    me.setWindow = function (window) {
        if (currentWindow) {
            currentWindow.disable();
        }
    };

    return me;
}(notepanel.windowManager || {});
