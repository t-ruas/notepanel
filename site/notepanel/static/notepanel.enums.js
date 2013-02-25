notepanel.enums = {
    
    // User groups
    userGroups: {
        OWNER : 1,
        ADMIN : 2,
        CONTRIBUTOR : 3,
        VIEWER : 4,
    },
    
    // Note option
    noteOptions: {
        NONE : 0,
        REMOVABLE : 1,
        MOVABLE : 2,
        RESISZEABLE : 4,
        EDITABLE : 8,
        COLORABLE : 16,
        // TODO : ALL : REMOVABLE | MOVABLE | RESISZEABLE | EDITABLE | COLORABLE
        //ALL : this.REMOVABLE | this.MOVABLE | this.RESISZEABLE | this.COLORABLE
        ALL : (1 | 2 | 4 | 8 | 16)
    },
    
    // Board privacies
    boardPrivacies: {
        PRIVATE: 1,
        INTERNAL_READONLY: 2,
        INTERNAL_EDITABLE: 3,
        PUBLIC: 4
    }
};