
notepanel.template = {};

notepanel.template.formatNoteText = function(note) {
    var formattedText = note.text;
    // TODO format according to note properties
    // => convert note properties in CanvasText class defined below (e.g. : <class='Tpb47'>[note.text]</class>)
    return formattedText;
};

notepanel.template.makeColor = function (value) {
    var col = notepanel.colors.fromRgbInt(value);
    return {
        code: notepanel.colors.toRgbHexString(col),
        css: notepanel.colors.toCssString(col)
    };
};

notepanel.template.noteColors = [
    notepanel.template.makeColor(0x29A1F1),
    notepanel.template.makeColor(0xFF5E99),
    notepanel.template.makeColor(0xFF0000),
    notepanel.template.makeColor(0xFFFF99),
    notepanel.template.makeColor(0x66FF66),
    notepanel.template.makeColor(0xFFFFFF)
];

notepanel.template.canvasText = new CanvasText();

notepanel.template.canvasText.config({
    canvasId: "canvas_board",
    //fontFamily: "GoodDogRegular",
    fontFamily: "JournalRegular",
    fontSize: "32px",
    fontWeight: "normal",
    fontColor: "#000",
    lineHeight: "20"
});

/*

var CanvasTextFontFamily = [
    ["I", "Impact"],
    ["T", "Times new roman"]
];
var CanvasTextFontColor = [
    ["b", "#29a1f1"], 
    ["p", "#ff5e99"]
];
var CanvasTextFontWeight = [
    ["n", "normal"],
    ["b", "bold"]
];


// TO USE for different fonts in a note
for(var i=10; i<48;i++) { // loop on fontSize
    for(var j=0; j<CanvasTextFontFamily.length;j++) { // loop on font family
        for(var k=0; k<CanvasTextFontColor.length;k++) { // long on font color
            for(var l=0; l<CanvasTextFontWeight.length;l++) { // loop on font weght
                var className = CanvasTextFontFamily[j][0] + CanvasTextFontColor[k][0] + CanvasTextFontWeight[l][0] + i;
                notepanel.template.canvasText.defineClass(className, {
                    fontSize: i + "px",
                    fontColor: CanvasTextFontColor[k][1],
                    fontFamily: CanvasTextFontFamily[j][1],
                    fontWeight: CanvasTextFontWeight[l][1]
                });
                console.log("new class loaded : " + className);
            }
        }
    }    
}



CanvasText.defineClass("blue",{
    fontSize: "24px",
    fontColor: "#29a1f1",
    fontFamily: "Impact",
    fontWeight: "normal"
});
    
CanvasText.defineClass("pink",{
    fontSize: "24px",
    fontColor: "#ff5e99",
    fontFamily: "Times new roman",
    fontWeight: "bold"
});

*/
