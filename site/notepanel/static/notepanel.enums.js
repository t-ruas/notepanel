notepanel.enums = {
    
    // User groups
    userGroups: {
        OWNER : 1,
        ADMIN : 2,
        CONTRIBUTOR : 3,
        VIEWER : 4,
    },
    
    // Note options
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
        PUBLIC: 2
    },
    
    // Board options
    boardOptions: {
        NONE : 0,
        ADDNOTE : 1,
        ZOOMABLE : 2,
        COLORABLE : 4,
        RESISZEABLE : 8,
        ALL : (1 | 2 | 4 | 8)
    }
};
