/* Copyright Joe Tsoi, FreeBSD-License
 * simple flot plugin to draw bar numbers halfway in bars
 *
 * options are
 * series: {
 *     bars: {
 *         numbers : {
 *             show : boolean,
 *             xAlign : null or function like function (x) {return x + 0.5;}, (if null, the text is in the middle)
 *             yAlign : null or function like function (y) {return y + 0.5;}, (if null, the text is in the middle)
 *             font : {size : number, style : string, weight : string, family : string, color : string}
 *         }
 *     }
 * }
 *
 * Examples for the "font" object:
 * font: {color: "grey"}
 * font: {weight: "bold", family: "san-serif"}
 * font: {size: 12, weight: "bold", family: "Verdana", color: "#545454"}
 * font: {size: 11, style: "italic", weight: "bold", family: "Arial", color: "blue"}
 */
(function ($) {
    var options = {
        bars: {
            numbers: {
            }
        }
    };

    function processOptions(plot, options) {
        var alignOffset = 0;
        if (options.series.bars.align === "left") {
            alignOffset = options.series.bars.barWidth / 2;
        } else if (options.series.bars.align === "right") {
            alignOffset = - options.series.bars.barWidth / 2;
        }

        var numbers = options.series.bars.numbers;
        var horizontal = options.series.bars.horizontal;
        if (horizontal) {
            numbers.xAlign = numbers.xAlign || function (x) {return x / 2;};
            numbers.yAlign = numbers.yAlign || function (y) {return y + alignOffset;};
            numbers.horizontalShift = 0;
        } else {
            if(options.series.bars.align === "center") {
                numbers.xAlign = numbers.xAlign || function(x){ return x; };
            } else {
                numbers.xAlign = numbers.xAlign || function(x){ return x + (alignOffset / 2); };
            }
            numbers.yAlign = numbers.yAlign || function(y){ return y / 2; };
            numbers.horizontalShift = 1;
        }
    }

    function draw(plot, ctx){
        $.each(plot.getData(), function(idx, series) {
            var show = (series.bars.numbers.show);
            if(show){
                var formatter = jQuery.isFunction(show) ? show : function(s) { return s.toString(10) };
                var ps = series.datapoints.pointsize;
                var points = series.datapoints.points;
                //var ctx = plot.getCanvas().getContext('2d');
                var offset = plot.getPlotOffset();
                ctx.save();
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";

                var font = series.bars.numbers.font;
                if (font) {
                    if (font.color) {
                        ctx.fillStyle = font.color;
                        ctx.strokeStyle = font.color;  // for better look
                    }

                    var fontStr = font.weight ? font.weight : "";
                    fontStr = font.style ? fontStr + " " + font.style : fontStr;
                    fontStr = font.size ? fontStr + " " + font.size + "px" : fontStr;
                    fontStr = font.family ? fontStr + " " + font.family : fontStr;
                    if (fontStr !== "") {
                        ctx.font = fontStr;
                    }
                }

                var xAlign = series.bars.numbers.xAlign;
                var yAlign = series.bars.numbers.yAlign;

                var axes = {
                    0: 'x',
                    1: 'y'
                };

                var hs = series.bars.numbers.horizontalShift;
                for (var i = 0; i < points.length; i += ps) {
                    var barNumber = i + hs;

                    var point = {
                        'x': xAlign(points[i]),
                        'y': yAlign(points[i + 1])
                    };

                    var text;
                    if (series.stack != null) {
                        var value = series.data[i / 3][hs];
                        point[axes[hs]] = (points[barNumber] - value + (hs == 0 ? xAlign(value) : yAlign(value)));
                        text = value;
                    } else {
                        text = points[barNumber];
                    }

                    // check against axis min. / max.
                    if ((series.xaxis.min && point.x < series.xaxis.min) ||
                        (series.xaxis.max && point.x > series.xaxis.max) ||
                        (series.yaxis.min && point.y < series.yaxis.min) ||
                        (series.yaxis.max && point.y > series.yaxis.max)) {
                        // don't render this number because it is out of range
                        continue;
                    }

                    var c = plot.p2c(point);
                    var txt = formatter(text)

                    // stroke for better look
                    ctx.lineWidth = 0.2;
                    ctx.strokeText(txt, c.left + offset.left, c.top + offset.top + 1);

                    ctx.fillText(txt, c.left + offset.left, c.top + offset.top + 1);
                }

                ctx.restore();
            }
        });
    }

    function init(plot) {
        plot.hooks.processOptions.push(processOptions);
        plot.hooks.draw.push(draw);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'barnumbers',
        version: '0.8'
    });
})(jQuery);
