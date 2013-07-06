Examples
========
For working examples checkout http://joetsoi.github.com/flot-barnumbers/

Usage
=====
simple flot plugin to draw bar numbers in bars, simply add

    series: {
        bars: {
            numbers: {
                show : boolean
            }
        }
    }

There are other additional options

    series: {
        bars: {
            numbers: {
                show : boolean,
                xAlign : function or number,
                yAlign : function or number,
                font : {size : number, style : string, weight : string, family : string, color : string}
            }
        }
    }

By default numbers will be positioned in the center of the bars, you can
specify a function or a number to override this behaviour. If you have a
horizontal bar chart, these 2 functions will switch round the axes they
are working on.
