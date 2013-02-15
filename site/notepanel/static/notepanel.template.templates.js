if (typeof notepanel == 'undefined') var notepanel = {}; 
notepanel.template = notepanel.template || {};
notepanel.template.templates = notepanel.template.templates || {};

notepanel.template.templates = function(me) {
  
    templatesFile = '';
    var compiledTemplates = [];
    var loaded = false;
    
    $(document).ready(function () {
        loadTemplates(null, null);
    });
    
    me.loadColorPicker = function(onClick) {
        if(loaded) {
            var template = compiledTemplates['hogan-tpl-color-picker'];
            if(template != null) {
                var htmlColors = template.render({colors: notepanel.template.noteColors});
                $("#ph_color_picker").html(htmlColors);
                $("#ph_color_picker div").on("click", onClick);
            } else {
                console.log('template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadColorPicker, onClick);
        }
    }

    me.loadBoardUserList = function(boardUsers) {
        if(loaded) {
            var template = compiledTemplates['hogan-tpl-board-user-list'];
            if(template != null) {
                var htmlBoardUserList = template.render({users: boardUsers});
                $("#ph_board_user_list").html(htmlBoardUserList);
            } else {
                console.log('template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadBoardUserList, null);
        }
    }

    var loadTemplates = function(callback, callbackArgs) {
        if(me.templatesFile && !loaded) {
            $.get(me.templatesFile, function(html) {
                var hoganTemplates = $(html).filter("script");
                for(var i=0;i<hoganTemplates.length;i++) {
                    var hoganTemplate = hoganTemplates[i].innerHTML;
                    var id = hoganTemplates[i].id;
                    var compiledTemplate = Hogan.compile(hoganTemplate);
                    compiledTemplates[id] = compiledTemplate;
                }
                loaded = true;
                if(callback) {
                    if(callbackArgs) {
                        callback(callbackArgs);
                    } else {
                        callback();
                    }
                }
            });
        } else {
            console.log('no template file defined');
        }
    }
    
    return me;
}(notepanel.template.templates|| {});