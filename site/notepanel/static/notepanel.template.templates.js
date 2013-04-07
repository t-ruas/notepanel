
notepanel.template.templates = function(me) {

    templatesFile = '';
    var compiledTemplates = {};
    me.loaded = false;

    $(document).ready(function () {
        loadTemplates();
    });

    var loadTemplate = function (options) {
        var template = compiledTemplates[options.name];
        if (template) {
            if (options.render) {
                return $(template.render(options.data, options.partials));
            } else {
                return template;
            }
        } else {
            console.log('Template not found');
        }
    };

    me.loadWindowPanel = function () {
        return loadTemplate({
            name: 'hogan-tpl-wnd-panel',
            render: true
        });
    };

    me.loadNoteEditor = function () {
        return loadTemplate({
            name: 'hogan-tpl-note_editor',
            render: true
        });
    };

    me.loadDialogLogin = function () {
        return loadTemplate({
            name: 'hogan-tpl-dlg-login',
            render: true,
            data: {providers: notepanel.openidProviders},
            partials: {openIdProviders: loadTemplate({name: 'hogan-tpl-provider-list'})}
        });
    };

    me.loadDialogMyBoards = function (list) {
        return loadTemplate({
            name: 'hogan-tpl-dlg-my-boards',
            render: true,
            data: {list: list},
            partials: {boardList: loadTemplate({name: 'hogan-tpl-board-list'})}
        });
    };

    me.loadDialogPublicBoards = function (list) {
        return loadTemplate({
            name: 'hogan-tpl-dlg-public-boards',
            render: true,
            data: {list: list},
            partials: {boardList: loadTemplate({name: 'hogan-tpl-board-list'})}
        });
    };

    me.loadDialogImportBoard = function (list) {
        return loadTemplate({
            name: 'hogan-tpl-dlg-import-board',
            render: true
        });
    };

    me.loadDialogNewBoard = function (list) {
        return loadTemplate({
            name: 'hogan-tpl-dlg-new-board',
            render: true
        });
    };

    me.loadColorPicker = function () {
        return loadTemplate({
            name: 'hogan-tpl-color-picker',
            render: true,
            data: {colors: notepanel.template.noteColors}
        });
        //$htmlColors.find('div').on('click', onClick);
    }

    me.loadBoardUserList = function (boardUsers) {
        for (var i in boardUsers) {
            user = boardUsers[i];
            user.userGroupLabel = notepanel.labels.userGroupLabels[user.group];
        }
        return loadTemplate({
            name: 'hogan-tpl-board-user-list',
            render: true,
            data: {users: boardUsers}
        });
    }

    me.loadBoardList = function (list) {
        return loadTemplate({
            name: 'hogan-tpl-board-list',
            render: true,
            data: {id: list.id, boards: list.boards}
        });
    }

    me.loadOpenidProviders = function (providers) {
        return loadTemplate({
            name: 'hogan-tpl-provider-list',
            render: true,
            data: {providers: providers}
        });
    };
    
    me.loadBoardSettingsForm = function (board) {
		// set inputs according to user permissions on the board
		// basic settings
		board.inputs = [];
		board.inputs.push(me.Form.toTextInput('Name: ', 'name', board.name));
		board.inputs.push(me.Form.toTextInput('Color: ', 'color', board.color));
		board.inputs.push(me.Form.toTextInput('Width: ', 'Width', board.width));
		board.inputs.push(me.Form.toTextInput('Height: ', 'height', board.height));
		// permissions
		var roles = {viewer : true, contributor : true};
		// TODO : a function which convert permissions in profiles
		/*
		var profiles = [
			viewer : 
				checked: true,
		]
		*/
		// TODO : set checked or not in roles foreach 
		board.permissions = [];
		board.permissions.push({id: notepanel.enums.boardOptions.ADDNOTE, label : 'Add notes', roles : roles});
		board.permissions.push({id: notepanel.enums.boardOptions.ZOOMABLE, label : 'Zoom', roles : roles});
		board.permissions.push({id: notepanel.enums.boardOptions.COLORABLE, label : 'Change background', roles : roles});
		board.permissions.push({id: notepanel.enums.boardOptions.RESIZABLE, label : 'Resize', roles : roles});
        return loadTemplate({
            name: 'hogan-tpl-board-settings-form',
            render: true,
            data: {board: board, roles: roles},
            partials: {
				textInput: loadTemplate({name: 'hogan-tpl-inline-input-form'}),
				permissionLineForm: loadTemplate({name: 'hogan-tpl-board-permissions-line-form'}),
				permissionColumnForm: loadTemplate({name: 'hogan-tpl-board-permissions-column-form'}),
				permissionForm: loadTemplate({name: 'hogan-tpl-board-permissions-form'})
				}
        });
    };

    var loadTemplates = function () {
        if(me.templatesFile && !me.loaded) {
            $.get(me.templatesFile, function(html) {
                var hoganTemplates = $(html).filter("script");
                for(var i=0;i<hoganTemplates.length;i++) {
                    var hoganTemplate = hoganTemplates[i].innerHTML;
                    var id = hoganTemplates[i].id;
                    var compiledTemplate = Hogan.compile(hoganTemplate);
                    compiledTemplates[id] = compiledTemplate;
                }
                me.loaded = true;
            });
        } else {
            console.log('no template file defined');
        }
    }
	
	/*
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
	*/
	me.Form = {
		
		toTextInput: function(label, name, value) {
			return this.toInput(label, name, 'text', '30', value);
		},
		
		toInput: function(label, name, type, size, value) {
			return {
				label: label,
				name: name,
				type: type,
				size: size,
				value: value
			};
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
