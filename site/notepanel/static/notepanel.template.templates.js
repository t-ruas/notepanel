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
                var $htmlColors = $(template.render({colors: notepanel.template.noteColors}));
                $htmlColors.find('div').on('click', onClick);
                return $htmlColors;
            } else {
                console.log('Template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadColorPicker, [onClick]);
        }
    }

    me.loadBoardUserList = function(boardUsers) {
        if(loaded) {
            var template = compiledTemplates['hogan-tpl-board-user-list'];
            if(template != null) {
                    for(var i in boardUsers) {
                        user = boardUsers[i];
                        user.userGroupLabel = notepanel.labels.userGroupLabels[user.group];
                    }
                    var htmlBoardUserList = template.render({users: boardUsers});
                $("#ph_board_user_list").html(htmlBoardUserList);
            } else {
                console.log('Template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadBoardUserList, [boardUsers]);
        }
    }
    
    me.loadBoardList = function(placeHolderId, list) {
        if(loaded) {
            var template = compiledTemplates['hogan-tpl-board-list'];
            if(template != null) {
                var htmlBoards = template.render({id: list.id, boards: list.boards});
                $("#"+placeHolderId).html(htmlBoards);
            } else {
                console.log('Template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadBoardList, [placeHolderId, list]);
        }
    }
    
    me.loadOpenidProviders = function(providers) {
        if(loaded) {
            var template = compiledTemplates['hogan-tpl-provider-list'];
            if(template != null) {
                var htmlProviders = template.render({providers: providers});
                $("#ph_provider_list").html(htmlProviders);
            } else {
                console.log('Template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadOpenidProviders, [providers]);
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
                        //console.log('callbackArgs');
                        //console.log(callbackArgs);
                        callback.apply(this, callbackArgs);
                    } else {
                        callback();
                    }
                }
            });
        } else {
            console.log('no template file defined');
        }
    }

    
    
    me.loadBoardSettingsForm = function(board) {
        if(loaded) {
            var template = compiledTemplates['hogan-tpl-board-settings-form'];
            if(template != null) {
                boardSettingsForm.name.value = board.name;
                boardSettingsForm.color.value = board.color;
                console.log(boardSettingsForm);
                var partials = {};
                partials.textInput = compiledTemplates['hogan-tpl-inline-input-form'];
                var htmlBoardSettings = template.render({board: boardSettingsForm}, partials);
                $("#ph_board_settings").html(htmlBoardSettings);
            } else {
                console.log('Template not found');
            }
        } else {
            console.log('Templates not loaded');
            loadTemplates(me.loadBoardSettingsForm, [board]);
        }
    }
    
    var boardSettingsForm = {
        name: {
            label: 'Name:',
            name: 'name',
            type: 'text',
            size: '30',
            value: ''
        },
        color: {
            label: 'Color:',
            name: 'color',
            type: 'text',
            size: '30',
            value: ''
        }
    }
    
    return me;
}(notepanel.template.templates|| {});