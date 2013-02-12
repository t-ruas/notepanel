var CanvasText = new CanvasText;

CanvasText.config({
    canvasId: "canvas_board",
    fontFamily: "GoodDogRegular",
    fontSize: "18px",
    fontWeight: "normal",
    fontColor: "#000",
    lineHeight: "20"
});

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
                CanvasText.defineClass(className, {
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

/*
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

