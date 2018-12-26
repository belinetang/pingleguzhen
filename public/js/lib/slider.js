
; $(function ($, window, document, undefined) {
    
    Slider = function (container, options) {
        /*
        options = {
            auto: true,
            time: 3000,
            event: 'hover' | 'click',
            mode: 'slide | fade',
            controller: $(),
            activeControllerCls: 'className',
            exchangeEnd: $.noop
        }
        */

        "use strict"; //stirct mode not support by IE9-

        if (!container) return;

        var options = options || {},
            currentIndex = 0,
            cls = options.activeControllerCls,
            delay = options.delay,
            isAuto = options.auto,
            controller = options.controller,
            event = options.event,
            interval,
            slidesWrapper = container.children().first(),
            slides = slidesWrapper.children(),
            length = slides.length,
            childWidth = container.width(),
            totalWidth = childWidth * slides.length;

        function init() {
            var controlItem = controller.children();

            mode();

            event == 'hover' ? controlItem.mouseover(function () {
                stop();
                var index = $(this).index();

                play(index, options.mode);
            }).mouseout(function () {
                isAuto && autoPlay();
            }) : controlItem.click(function () {
                stop();
                var index = $(this).index();

                play(index, options.mode);
                isAuto && autoPlay();
            });

            isAuto && autoPlay();
        }

        //animate mode
        function mode() {
            var wrapper = container.children().first();

            options.mode == 'slide' ? wrapper.width(totalWidth) : wrapper.children().css({
                'position': 'absolute',
                'left': 0,
                'top': 0
            })
                .first().siblings().hide();
        }

        //auto play
        function autoPlay() {
            interval = setInterval(function () {
                triggerPlay(currentIndex);
            }, options.time);
        }

        //trigger play
        function triggerPlay(cIndex) {
            var index;

            (cIndex == length - 1) ? index = 0 : index = cIndex + 1;
            play(index, options.mode);
        }

        //play
        function play(index, mode) {
            slidesWrapper.stop(true, true);
            slides.stop(true, true);

            mode == 'slide' ? (function () {
                if (index > currentIndex) {
                    slidesWrapper.animate({
                        left: '-=' + Math.abs(index - currentIndex) * childWidth + 'px'
                    }, delay);
                } else if (index < currentIndex) {
                    slidesWrapper.animate({
                        left: '+=' + Math.abs(index - currentIndex) * childWidth + 'px'
                    }, delay);
                } else {
                    return;
                }
            })() : (function () {
                if (slidesWrapper.children(':visible').index() == index) return;
                slidesWrapper.children().fadeOut(delay).eq(index).fadeIn(delay);
            })();

            try {
                controller.children('.' + cls).removeClass(cls);
                controller.children().eq(index).addClass(cls);
            } catch (e) { }

            currentIndex = index;

            options.exchangeEnd && typeof options.exchangeEnd == 'function' && options.exchangeEnd.call(this, currentIndex);
        }
        //init
        init();
    };

}(jQuery, window, document));