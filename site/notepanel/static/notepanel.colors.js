
notepanel.colors = {};

notepanel.colors.parse = function (str) {
    var col = {r: 0, g: 0, b: 0, a: 0xFF};
    var get = function (a, b) {
        return parseInt(str.substr(a, b), 16);
    };
    switch (str.length) {
        case 4:
            col.a = get(3, 1);
        case 3:
            col.r = get(1, 1);
            col.g = get(2, 1);
            col.b = get(3, 1);
            break;
        case 8:
            col.a = get(6, 2);
        case 6:
            col.r = get(0, 2);
            col.g = get(2, 2);
            col.b = get(4, 2);
            break;
        default:
            return null;
    };
    return col;
};

notepanel.colors.lighten = function (col, coef) {
    var inc = function (val) {
        return Math.min(val + coef, 0xFF);
    };
    col.r = inc(col.r);
    col.g = inc(col.g);
    col.b = inc(col.b);
};

notepanel.colors.darken = function (col, coef) {
    var dec = function (val) {
        return Math.max(val - coef, 0x00);
    };
    col.r = dec(col.r);
    col.g = dec(col.g);
    col.b = dec(col.b);
};

notepanel.colors.stringify = function (num) {
    num = num.toString(16);
    switch (num.length) {
        case 1: return '0' + num;
        case 2: return num;
        default: return null;
    }
};

notepanel.colors.type = {
    rgb: 0,
    rgba: 1
};

notepanel.colors.toString = function (col, type) {
    var str = notepanel.colors.stringify;
    switch (type) {
        case notepanel.colors.type.rgb: return str(col.r) + str(col.g) + str(col.b);
        case notepanel.colors.type.rgba: return str(col.r) + str(col.g) + str(col.b) + str(col.a);
        default: return null;
    }
};
