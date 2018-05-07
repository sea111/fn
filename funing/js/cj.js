$.fn.extend({
    //下拉选择
    select: function (o) {
        var $selector = $(this).selector;
        o = $.extend({
            //content: ".selects",
            liClickDefault: true,
            liClickCallback: $.noop,//点击事件回调函数,liClickDefault需为true
            height: "100",
            auto: false
        }, o || {});
        var text = $("" + $selector + " input").val();
        var classname = $(this).attr("class");
        var id = $(this).attr("id");

        var that = "." + $(this).attr("class");
        $("" + $selector + " li").addClass("no");
        var width = $("" + $selector + " .name-input").width();
        $("" + $selector + " ul").css("width", "" + width + "");
        $("" + $selector + " ul li").css("width", "" + width + "");

        $("" + $selector + " li").each(function () {
            if ($(this).text() == text) {
                $(this).addClass("active");
                return;
            }
        });

        if (o.liClickDefault) {
            $("" + $selector + " li").click(function () {
                $("" + $selector + " li").addClass("no").removeClass("active");
                $(this).removeClass("no").addClass("active");
                var text = $(this).html();
                var value = $(this).val();
                var $that = $(this).parent().parent().find("input");
                $that.val(text);
                $that.attr("title", text);
                $that.attr("data-value", value);
                if (typeof (o.liClickCallback) == "function") {
                    o.liClickCallback();
                }
            });
        }

        $("" + $selector + "").click(function () {
            var classs = $(this).find("ul").css("max-height", "" + o.height + "px");
            $("" + $selector + " ul").not(classs).fadeOut(0);
            $(this).find("ul").toggle();
            var div_height = $("" + $selector + "").height();
            var input_height = $("" + $selector + " input").outerHeight(true);
            var cz = parseInt(div_height - input_height) / 2;
            var tt = input_height + cz;
            $("" + $selector + " ul").css("top", "" + tt + "px");
            if (o.auto) {
                var wdiv = $(".pot-list").offset().top + $(".pot-list").height();
                var po = $("" + $selector + "").offset().top;
                var ul_height = $("" + $selector + " ul").height();
                if ($("" + $selector + " ul").is(":visible")) {
                    if (wdiv - po < ul_height) {
                        var top = ul_height - cz;
                        $("" + $selector + " ul").css("top", "-" + top + "px");
                    }
                }
            }
        });

        $(document).bind('click', function (e) {
            var e = e || window.event; //浏览器兼容性
            var elem = e.target || e.srcElement;
            while (elem) { //循环判断至跟节点，防止点击的是div子元素
                if (elem.id && elem.id == '' + id + '') {
                    return;
                }
                elem = elem.parentNode;
            }

            $('' + $selector + ' ul').fadeOut(0); //点击的不是div或其子元素
        });
    }
});
