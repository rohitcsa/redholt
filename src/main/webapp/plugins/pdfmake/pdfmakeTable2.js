
function ParseContainer2(cnt, e, p, styles) {
    var elements = [];
    var children = e.childNodes;
    if (children.length != 0) {
        for (var i = 0; i < children.length; i++)
            p = ParseElement2(elements, children[i], p, styles);
    }
    if (elements.length != 0) {
        for (var i = 0; i < elements.length; i++)
            cnt.push(elements[i]);
    }
    return p;
}

function ComputeStyle2(o, styles) {
    for (var i = 0; i < styles.length; i++) {
        var st = styles[i].trim().toLowerCase().split(":");
        if (st.length == 2) {
            switch (st[0]) {
                case "font-size":
                {
                    o.fontSize = parseInt(st[1]);
                    break;
                }
                case "text-align":
                {
                    switch (st[1]) {
                        case "right":
                            o.alignment = 'right';
                            break;
                        case "center":
                            o.alignment = 'center';
                            break;
                    }
                    break;
                }
                case "font-weight":
                {
                    switch (st[1]) {
                        case "bold":
                            o.bold = true;
                            break;
                    }
                    break;
                }
                case "text-decoration":
                {
                    switch (st[1]) {
                        case "underline":
                            o.decoration = "underline";
                            break;
                    }
                    break;
                }
                case "font-style":
                {
                    switch (st[1]) {
                        case "italic":
                            o.italics = true;
                            break;
                    }
                    break;
                }
            }
        }
    }
}

function ParseElement2(cnt, e, p, styles) {
    if (!styles)
        styles = [];
    if (e.getAttribute) {
        var nodeStyle = e.getAttribute("style");
        if (nodeStyle) {
            var ns = nodeStyle.split(";");
            for (var k = 0; k < ns.length; k++)
                styles.push(ns[k]);
        }
    }

    switch (e.nodeName.toLowerCase()) {
        case "#text":
        {
            var t = {text: e.textContent.replace(/\n/g, "")};
            if (styles)
                ComputeStyle2(t, styles);
            p.text.push(t);
            break;
        }
        case "b":
        case "strong":
        {
            ParseContainer2(cnt, e, p, styles.concat(["font-size:10px"]));
            break;
        }
        case "u":
        {
            ParseContainer2(cnt, e, p, styles.concat(["text-decoration:underline"]));
            break;
        }
        case "i":
        {
            ParseContainer2(cnt, e, p, styles.concat(["font-style:italic"]));
            break;
        }
        case "span":
        {
            ParseContainer2(cnt, e, p, styles.concat(["font-size:10px"]));
            break;
        }
        case "font":
        {
            ParseContainer2(cnt, e, p, styles.concat(["font-size:10px"]));
            break;
        }
        case "br":
        {
            p = CreateParagraph2();
            cnt.push(p);
            break;
        }
        case "table":
        {
            var t = {
                //layout: 'headerLineOnly',
                margin: [0, 20, 0, 0],
                table: {
                    headerRows: 1,
                    layout: 'lightHorizontalLines',
                    //dontBreakRows: true,
                    //keepWithHeaderRows: 1,
                    widths: [],
                    body: []
                }
            }
            var border = e.getAttribute("border");
            var isBorder = false;
            if (border)
                if (parseInt(border) == 1)
                    isBorder = true;
            if (!isBorder)
                t.layout = 'headerLineOnly';
            ParseContainer2(t.table.body, e, p, styles.concat(["font-size:10px"]));

            var widths = e.getAttribute("widths");
            if (!widths) {
                if (t.table.body.length != 0) {
                    if (t.table.body[0].length != 0)
                        for (var k = 0; k < t.table.body[0].length; k++)
                            t.table.widths.push("*");
                }
            } else {
                var w = widths.split(",");
                for (var k = 0; k < w.length; k++)
                    t.table.widths.push(w[k]);
            }
            cnt.push(t);
            break;
        }
        case "tbody":
        {
            ParseContainer2(cnt, e, p, styles);
            break;
        }
        case "thead":
        {
            ParseContainer2(cnt, e, p, styles.concat(["font-weight:bold"], ["font-size:10px"]));
            break;
        }
        case "tfoot":
        {
            ParseContainer2(cnt, e, p, styles.concat(["font-weight:bold"], ["font-size:10px"]));
            break;
        }
        case "tr":
        {
            var row = [];
            ParseContainer2(row, e, p, styles.concat(["font-size:10px"]));
            cnt.push(row);
            break;
        }
        case "td":
        {
            p = CreateParagraph2();
            var st = {stack: []}
            st.stack.push(p);

            var rspan = e.getAttribute("rowspan");
            if (rspan)
                st.rowSpan = parseInt(rspan);
            var cspan = e.getAttribute("colspan");
            if (cspan)
                st.colSpan = parseInt(cspan);

            ParseContainer2(st.stack, e, p, styles.concat(["font-size:10px"]));
            cnt.push(st);
            break;
        }
        case "th":
        {
            p = CreateParagraph2();
            var st = {stack: []}
            st.stack.push(p);

            var rspan = e.getAttribute("rowspan");
            if (rspan)
                st.rowSpan = parseInt(rspan);
            var cspan = e.getAttribute("colspan");
            if (cspan)
                st.colSpan = parseInt(cspan);

            ParseContainer2(st.stack, e, p, styles);
            cnt.push(st);
            break;
        }
        case "div":
        case "p":
        {
            p = CreateParagraph2();
            var st = {stack: []}
            st.stack.push(p);
            ComputeStyle2(st, styles);
            ParseContainer2(st.stack, e, p);

            cnt.push(st);
            break;
        }
        default:
        {
            if (e.nodeName !== "ICON") {
                console.log("Parsing for node " + e.nodeName + " not found");
            }
            break;
        }
    }
    return p;
}

function ParseHtml2(cnt, htmlText) {
    var html = $(htmlText.replace(/\t/g, "").replace(/\n/g, ""));
    var p = CreateParagraph2();
    for (var i = 0; i < html.length; i++)
        ParseElement2(cnt, html.get(i), p);
}

function CreateParagraph2() {
    var p = {text: []};
    return p;
}
