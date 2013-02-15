function Color(name, code) {
    this.name = name;
    this.code = code;
};

if (typeof notepanel == 'undefined') var notepanel = {}; 
notepanel.template = notepanel.template || {};

notepanel.template.formatNoteText = function(note) {
    var formattedText = note.text;
    // TODO format according to note properties
    // => convert note properties in CanvasText class defined below (e.g. : <class='Tpb47'>[note.text]</class>)
    return formattedText;
};

notepanel.template.noteColors = [
    new Color("blue", "29a1f1"), 
    new Color("pink", "ff5e99"),
    new Color("red", "FF0000"),
    new Color("yellow", "FFFF99"),
    new Color("green", "66FF66"),
    new Color("white", "ffffff")
];

notepanel.template.canvasText = new CanvasText();

notepanel.template.canvasText.config({
    canvasId: "canvas_board",
    fontFamily: "GoodDogRegular",
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

