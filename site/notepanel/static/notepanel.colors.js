
notepanel.colors = {};

notepanel.colors.fromRgbaInt = function (num) {
    return {
        r: (num >> 24) & 0xFF,
        g: (num >> 16) & 0xFF,
        b: (num >> 8) & 0xFF,
        a: num & 0xFF
    };
};

notepanel.colors.fromRgbInt = function (num) {
    return {
        r: (num >> 16) & 0xFF,
        g: (num >> 8) & 0xFF,
        b: num & 0xFF,
        a: 0xFF
    };
};

notepanel.colors.fromHexString = function (str) {
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

notepanel.colors.toRgbaInt = function (col) {
    return (col.r << 24) | (col.g << 16) | (col.b << 8) | col.a;
};

notepanel.colors.toRgbInt = function (col) {
    return (col.r << 16) | (col.g << 8) | col.b;
};

notepanel.colors.toCssString = function (col) {
    var str = function (num) {
        return num.toString(10);
    };
    return 'rgba(' + str(col.r) + ',' + str(col.g) + ',' + str(col.b) + ',' + str(col.a) / 0xFF + ')';
};

notepanel.colors.toRgbHexString = function (col) {
    var str = function (num) {
        num = num.toString(16);
        switch (num.length) {
            case 1: return '0' + num;
            case 2: return num;
            default: return null;
        }
    };
    return str(col.r) + str(col.g) + str(col.b);
};
