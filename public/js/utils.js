/**
 * Created by chengwb on 2016/8/6.
 * 备注：
 *  命名规则：函数的名称应该使用动词+名词，变量名则最好使用名词。
 *      常量区变量请全部用大写字母,且单词间用下划线链接；
 *      方法名、普通变量名请使用小驼峰命名规则，即除了第一个单词的首字母外其余单词首字母大写。
 */
(function (global, $, undefined) {
    global.tools = global.tools || {};

    /***********************************************************
     *********************** 常量区 *****************************
     **********************************************************/
    //暂无数据
    global.tools.NO_DATA = '<p class="no-data">暂无数据！</p>';
    global.tools.NO_DATA1 = '<p class="no-data1">暂无数据！</p>';
    //获取数据失败，刷新页面
    global.tools.TRY_REFRESH = '<p class="try-refresh">获取服务器数据失败，请尝试刷新浏览器页面！</p>';
    global.tools.TRY_REFRESH1 = '<p class="try-refresh1">获取服务器数据失败，请尝试刷新浏览器页面！</p>';

    /***********************************************************
     *********************** 方法区 *****************************
     **********************************************************/

    var _prefix = '/server'; //可配置统一前缀，配合node端动态路由，请勿随意改动
    /**
     * 设置ajax请求地址前缀，例子：如果node后台识别的是/api开头的地址，则可以设置_prefix为‘/api’
     * 设置后在下面的request函数中生效，所以有需求的话，请先设置前缀
     * @param prefix 前缀字符串
     */
    global.tools.setAjaxPrefix = function (prefix) {
        _prefix = prefix;
    };

    /**
     * ajax请求，统一处理
     * @param options 必传
     * {
       *  url: 接口地址，以‘/’开头，（纯url地址，参数数据可以放data里面）
       *  method: GET PUT POST DELETE，默认GET
       *  data: 数据,
       *  type: true/false  (使用前缀时)是否使用电商接口  true 为使用电商接口  默认为false 使用资讯接口
       *  prefix: true/false true使用前缀（需通过setAjaxPrefix方法设置），false不使用前缀，默认值为true
       * }
     * @param callback 回调方法，必传
     */
    global.tools.request = function(options, callback) {
        // var prefix = _prefix ? (options.prefix !== false ? _prefix : '') : '';
        var prefix = options.prefix !== false ? ( options.type === true ? "/server/b/" : "/server/a/"): '';
        $.ajax({
            url: prefix + options.url+"?"+ new Date().toTimeString() ,
            type: options.method || 'GET',//GET PUT POST DELETE
            data: options.data || {},
            traditional: true,//{foo:["bar1", "bar2"]} 转换为 '&foo=bar1&foo=bar2'
            complete: function (jqXHR, textStatus) {
                if (textStatus === 'success') {
                    var result = $.parseJSON(jqXHR.responseText);
                    callback(result);
                } else if(textStatus === 'timeout') {
                    callback({
                        error: true,
                        message: '服务器响应超时'
                    });
                } else {
                    callback({
                        error: true,
                        message: '服务器错误'
                    });
                }
            }
        });
    };
    global.tools.requestRetailers = function(options, callback) {
        // var prefix = _prefix ? (options.prefix !== false ? _prefix : '') : '';
        var prefix = options.prefix !== false ? ( options.type === true ? "/server/b/" : "/server/a/"): '';
        $.ajax({
            url: prefix + options.url,
            type: options.method || 'GET',//GET PUT POST DELETE
            data: options.data || {},
            traditional: true,//{foo:["bar1", "bar2"]} 转换为 '&foo=bar1&foo=bar2'
            complete: function (jqXHR, textStatus) {
                if (textStatus === 'success') {
                    var result = $.parseJSON(jqXHR.responseText);
                    callback(result);
                } else if(textStatus === 'timeout') {
                    callback({
                        error: true,
                        message: '服务器响应超时'
                    });
                } else {
                    callback({
                        error: true,
                        message: '服务器错误'
                    });
                }
            }
        });
    };
    /**
     * 正在加载中提示
     * @param option
     *  可以是对象
     *  {
     *      selector: '',//选择器
     *      position: ''//插入的位置（相对于选择器而言）before/in/after,前、中、后
    *  }
     *  也可以是字符串(表示selector，插入位置默认为in)
     * @param custom 回调函数，可以加工loadTip也可以自定义提示
     * @returns {{clean: clean}} 如果自定义loadTip则clean可能无效，需要自己根据自定义的tip进行清空处理（先使用着，待完善处理）
     */
    global.tools.loading = function (option, custom) {
        var loadTip = '<div class="loading-tips" style=""><img src="image/loading.gif"><p>数据加载中...</p></div>';
        if (custom && $.isFunction(custom)) {
            loadTip = custom(loadTip);
        }

        if(typeof option === 'string') {
            $(option).append(loadTip);
        } else {
            switch (option.position) {
                case 'in':
                    $(option.selector).append(loadTip);
                    break;
                case 'after':
                    $(option.selector).after(loadTip);
                    break;
                case 'before':
                    $(option.selector).before(loadTip);
                    break;
                default:
                    $(option.selector).append(loadTip);
                    break;
            }
        }

        function clean() {
            if(typeof option === 'string') {
                $(option + ' .loading-tips').remove();
            } else {
                switch (option.position) {
                    case 'in':
                        $(option.selector + ' .loading-tips').remove();
                        break;
                    case 'after':
                    case 'before':
                        $(option.selector).siblings('.loading-tips').remove();
                        break;
                    default:
                        $(option.selector + ' .loading-tips').remove();
                        break;
                }
            }
        }

        return {
            clean: clean
        };
    };

    /**
     * 内容长度限制，转换为省略号结尾
     * @param content 目标内容
     * @param length 限制的长度
     * @returns {*} 超过限制长度的数据则返回限制长度的字符串加上...，没超过则原文返回
     */
    global.tools.ellipsisContent = function (content, length) {
        var result;

        if (!content || typeof content !== 'string' ||
            typeof length !== 'number' || content.length <= length || length <= 0) {
            result = content;
        } else {
            result = content.substr(0, length) + "...";
        }
        return result;
    };

    /**
     * 图片加载异常时调用，一般用于img中的onerror=tools.errImg(this)
     * @param tag
     */
    global.tools.errImg = function (el) {
        el.src = "../image/list-xxentertainment-banner.jpg";
        el.onerror = null;
    };

    /**
     * 瀑布流图片加载异常时调用，一般用于img中的onerror
     * @param el 当前图片元素
     * @param defaultHeight 设置该元素的高度，默认为bad.jpg的高度
     */
    global.tools.waterfallErrImg = function (el, defaultHeight) {
        defaultHeight = defaultHeight || 240;//240px为bad.jpg的高度
        $(el).height(defaultHeight);

        el.src = "/image/bad.jpg";
        el.onerror = null;
    };

    /**
     *百度分享
     */
    global.tools.share = function () {
        window._bd_share_config = {
            "common": {
                "bdSnsKey": {},
                "bdText": "",
                "bdMini": "2",
                "bdDesc": "",
                "bdMiniList": false,
                "bdPic": "",
                "bdUrl": "",
                "bdStyle": "2",
                "bdSize": "16"/*,
                "bdPopupOffsetLeft": "30"*/
            },
            "share": {}
        };
        with (document)0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5)];
        if(window._bd_share_main){
            window._bd_share_main.init();
        }
    };

    /**
     * 日期处理，
     * @param dataStr 需要处理的日期字符串，如果不传递则默认为当前时间
     * @returns {{getCurrentYear: getCurrentYear, getCurrentMonth: getCurrentMonth, renderYears: renderYears, renderMonths: renderMonths}}
     */
    global.tools.date = function (time) {
        var year = 1970;
        var month = 1;
        var day = 1;
        var date = new Date();
        //var reg = new RegExp("-");//火狐不兼容

        if (time) {
            if (typeof time === 'string') {
                date = new Date(time.replace(/-/g, "/"));
            } else if (typeof time === 'number') {
                date = new Date(time);
            }
        }

        year = date.getFullYear();
        month = date.getMonth() + 1;
        day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var week = date.getDay();

        function getCurrentYear() {
            return year;
        }

        function getCurrentMonth() {
            return month;
        }

        function getDay() {
            return day;
        }

        function getHour() {
            return hours;
        }

        function getDate(separator) {
            return year + separator + month + separator + day;
        }

        function getTime() {
            return (hours < 10 ? ('0' + hours) : hours) + ':' +
                (minutes < 10 ? ('0' + minutes) : minutes) + ':' +
                (seconds < 10 ? ('0' + seconds) : seconds);
        }

        function getWeek() {
            var weekDesc = '星期';

            switch (week) {
                case 1:
                    weekDesc += '一';
                    break;
                case 2:
                    weekDesc += '二';
                    break;
                case 3:
                    weekDesc += '三';
                    break;
                case 4:
                    weekDesc += '四';
                    break;
                case 5:
                    weekDesc += '五';
                    break;
                case 6:
                    weekDesc += '六';
                    break;
                case 0:
                    weekDesc += '日';
                    break;
                default:
                    break;
            }
            return weekDesc;
        }

        /**
         * 渲染select的选项
         * @param select select的选择器
         * @param from 从哪一年开始，不设置默认是1970
         * @param to   到那一年，不设置默认为当前年份
         */
        function renderYears(select, from, to) {
            var options = '';
            var startYear = 1970;
            var endYear = year;
            var $select = $(select);

            if (from && $.isNumeric(from)) {
                startYear = from;
            }
            if (to && $.isNumeric(to)) {
                endYear = to;
            }

            var i = endYear;
            for (i; i >= startYear; i--) {
                options += '<option value="' + i + '">' + i + '年</option>';
            }

            $select.empty();
            $select.append(options);
        }

        /**
         * 渲染select的选项
         * @param select select的选择器
         * @param from 从哪一年开始，不设置默认是1970
         * @param to   到那一年，不设置默认为当前年份
         */
        function renderSpecialYears(select, years) {
            var options = '';
            var $select = $(select);

            var i = 0;
            var length = years.length;
            for (i = 0; i < length; i++) {
                options += '<option value="' + years[i] + '">' + years[i] + '年</option>';
            }

            $select.empty();
            $select.append(options);
        }

        /**
         * 渲染select中月份选项
         * @param select select的选择器
         * @param assignYear 指定那一年，没指定则1-12月
         */
        function renderMonths(select, assignYear) {
            var options = '';
            var startMonth = 1;
            var endMonth = 12;
            var $select = $(select);

            if (assignYear && $.isNumeric(assignYear)) {
                if (year == assignYear) {
                    endMonth = month;
                }
            }

            var i = startMonth;
            for (i; i <= endMonth; i++) {
                options += '<option value="' + i + '">' + i + '月</option>';
            }

            $select.empty();
            $(select).append(options);

            if (assignYear && $.isNumeric(assignYear)) {
                if (year == assignYear) {
                    $select.val(month);
                }
            }
        }

        /**
         * 格式化时间
         * @param format 默认为'yyyy-MM-dd hh:mm'
         * @returns {*}
         */
        function format(format) {
            if(!format) {
                format = 'yyyy-MM-dd hh:mm';
            }
            var time = {
                "M+": month,
                "d+": day,
                "h+": hours,
                "m+": minutes,
                "s+": seconds,
                "q+": Math.floor((month + 2) / 3),
                "S+": date.getMilliseconds()
            };
            if (/(y+)/i.test(format)) {
                format = format.replace(RegExp.$1, (year + '').substr(4 - RegExp.$1.length));
            }
            for (var k in time) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length === 1 ?
                        time[k] : ("00" + time[k]).substr(("" + time[k]).length));
                }
            }
            return format;
        }

        return {
            format: format,
            getYear: getCurrentYear,
            getMonth: getCurrentMonth,
            getDay: getDay,
            getTime: getTime,
            getDate: getDate,
            getHour: getHour,
            getWeek: getWeek,
            renderYears: renderYears,
            renderSpecialYears: renderSpecialYears,
            renderMonths: renderMonths
        };
    };

    /**
     * 格式化数字，例如：12300400格式化为12,300,400
     * @param number
     */
    global.tools.formatDigital = function (number) {
        var result = number;

        if (!number || !$.isNumeric(number)) {
            return result;
        }

        var numberStr = number.toString();
        var pointIndex = numberStr.indexOf('.');
        var lastIndex = numberStr.length - 1;

        if (pointIndex >= 0) {
            lastIndex = pointIndex - 1;
        }

        result = '';
        var count = 1;
        for (var i = lastIndex; i >= 0; i--, count++) {
            var temp = numberStr[i];

            result = temp + result;
            if (count % 3 === 0 && i !== 0) {
                result = ',' + result;
            }
        }
        return result;
    };

    /**
     * 初始定位侧边悬浮导航。注意使用时，侧边导航栏高度请设置为auto。
     * @param options
     * {
	 *  wrapper: 外框选择器（包含侧边栏和内容区）
	 *  head：头部，没有则设置为空；
	 *  foot: 底部，没有则设置为空；
	 *  contentStartIndex: 内容列表有效起始索引；
	 *  navStartIndex: 导航栏列表有效起始索引;
	 *  sideNav: 导航栏选择器，例子id:'#nav',class:'.nav'
	 *  sideNavEntry: 导航栏列表选择器，例子li元素：'li',class:'.entry'；（与sideNav是父子关系）
	 *  content: 内容区选择器
	 *  contentEntry: 内容区列表选择器（与content是父子关系）;
	 *  selectClass: 选中的侧边导航栏的选项class，如：'curr';
	 *  currIndex: 设置默认选中的导航栏索引,-1表示不设置；
	 *  scrollAnimate: true则使用动画，false为不使用，默认为使用动画;
	 *  position: 侧边导航栏原始定位方式，absolute(float布局)，relative（非float布局）
	 * }
     */
    global.tools.sideNavInit = function (options) {
        //待检查参数
        var animate = !!options.scrollAnimate || true;
        var headHeight = options.head ? $(options.head).height() : 0;
        var footHeight = options.foot ? $(options.foot).height() : 0;
        var windowHeight = $(window).height();
        var sideNavHeight = windowHeight - headHeight;
        var clickIndex = -1; //导航栏鼠标点击的元素的索引
        var contentStartIndex = options.contentStartIndex;//内容列表起始索引
        var navStartIndex = options.navStartIndex;//导航栏列表起始索引
        var $sideNav = $(options.sideNav);
        var sideNavInitHeight = $sideNav.height();
        var $sideNavLi = $(options.sideNav + ' > ' + options.sideNavEntry);
        var $contentLi = $(options.content + ' > ' + options.contentEntry);
        var selectClass = options.selectClass;
        var defaultIndex = options.currIndex;

        var nav2HeadDistance = $sideNav.offset().top - headHeight;//侧边导航栏到头部的距离
        var scrollDistance = 0;//滚动条滚动的距离

        //设置左边导航的高度,
        if (sideNavHeight > sideNavInitHeight) {
            $sideNav.css("height", sideNavHeight);
        } else {
            sideNavHeight = sideNavInitHeight + footHeight;
            $sideNav.css("height", sideNavHeight);
        }

        /**
         * 窗口自动定位
         */
        function clickPosition() {
            var targetIndex = clickIndex - navStartIndex + contentStartIndex;
            var entryTop = $contentLi.eq(targetIndex).offset().top;

            scrollWindow(entryTop, function () {
                if (clickIndex > -1) {
                    $sideNavLi.eq(clickIndex).addClass(selectClass).siblings('.' + selectClass).removeClass(selectClass);
                    clickIndex = -1;
                }
            });
        }

        /**
         * 滚动窗口
         * @param scrollTop 窗口滚动的距离
         * @param done 滚动完成后的回调
         */
        function scrollWindow(scrollTop, done) {
            if (animate) {
                $('html, body').stop(true).animate({
                    scrollTop: scrollTop - headHeight
                }, {
                    duration: 100,
                    always: done //动画不管完没完成总是会执行这个回调
                });
            } else {
                //不使用动画
                $('html, body').scrollTop(scrollTop - headHeight);
                done();
            }
        }

        /**
         * 图片加载过程中，定位校正
         */
        function regulatePosition() {
            var selectedNavIndex = $sideNav.find('.' + selectClass).index();
            var length = $contentLi.length;
            var absIndex = selectedNavIndex - navStartIndex;
            var sideNavTop = $sideNav.offset().top;
            var mistake = 5;//误差范围，浏览器滚动一次长度不一致

            var currContentTop = $contentLi.eq(absIndex + contentStartIndex).offset().top;
            var nextContentTop = absIndex < length - 1 ? $contentLi.eq(absIndex + 1 + contentStartIndex).offset().top : 99999;

            if (sideNavTop >= currContentTop - mistake &&
                sideNavTop < nextContentTop - mistake) {

                return;
            }
            scrollWindow(currContentTop, function () {
                $sideNavLi.eq(selectedNavIndex).addClass(selectClass).siblings('.' + selectClass).removeClass(selectClass);
            });
        }

        //导航栏点击事件
        $sideNav.on("click", options.sideNavEntry, function () {
            clickIndex = $(this).index();

            //如果点击的导航栏条目的index小于有效的导航栏起始index则不处理，即不是有效的栏目就不处理事件
            if (clickIndex < navStartIndex) {
                return;
            }

            //自动对齐导航栏和内容
            clickPosition();
        });

        //窗口大小变化事件，动态修改侧边栏位置
        $(window).on('resize', function () {
            //如果侧边导航栏是处于悬浮状态则动态修改位置
            if ($sideNav.css('position') === 'fixed') {
                var left = $(options.wrapper).offset().left;
                $sideNav.css({left: left + 'px'});
            }
        });

        $(window).on("scroll", function () {
            scrollDistance = $(document).scrollTop();
            //如果窗口的滚动距离大于了侧边导航栏到头部的距离则悬浮侧边导航栏
            if (scrollDistance > nav2HeadDistance) {
                var left = $(options.wrapper).offset().left;
                var footTop = footHeight === 0 ? $('html').height() : $(options.foot).offset().top;
                //左侧导航栏数据区域的底部抵达foot的时候，如果用户继续往下滚动则保持左侧导航栏数据区底部与foot相切
                var distance = (scrollDistance + headHeight + sideNavInitHeight) - footTop;
                if (distance > 0) {
                    $sideNav.css({position: "fixed", top: (headHeight - distance) + "px", left: left + 'px'});
                } else {
                    $sideNav.css({position: "fixed", top: headHeight + "px", left: left + 'px'});
                }
            } else {
                if ($sideNav.css('position') !== 'absolute') {
                    $sideNav.css({position: 'absolute', top: "0", left: '0'});
                }
            }

            //根据窗口滚动情况动态设置左边导航栏的选中项
            autoSelectNav();
        });

        /**
         * 左侧导航栏根据窗口滚动情况自动选择选项
         */
        function autoSelectNav() {
            var length = $contentLi.length;
            var sideNavTop = $sideNav.offset().top;
            var mistake = 5;//误差范围，浏览器滚动一次长度不一致

            //当左侧导航栏的位置在右边内容列表的某个条目内，则设置侧边导航栏选中该条目对应的选项（通过index对应）
            for (var i = 0; i < length; i++) {
                var currContentTop = $contentLi.eq(i + contentStartIndex).offset().top;
                var nextContentTop = i < length - 1 ? $contentLi.eq(i + 1 + contentStartIndex).offset().top : 99999;

                if (sideNavTop >= currContentTop - mistake &&
                    sideNavTop < nextContentTop - mistake) {

                    if (clickIndex > -1 && clickIndex !== i + navStartIndex) {
                        return;
                    }

                    $sideNavLi.eq(i + navStartIndex).addClass(selectClass).siblings('.' + selectClass).removeClass(selectClass);
                    break;
                }
            }
        }

        /**
         * 图片加载过程中校正被影响的定位。每加载完一张就校正定位（待优化为每正在加载一张就校正定位，难度较大）。
         * 此方法使用在进入页面就有默认定位时，如果没有默认定位则不必调用。
         */
        function perImgLoadPosition() {
            $contentLi.find('img').each(function (index) {
                //之前用deferred是想到等所有图片加载完后才校正位置；
                //后来经过优化每张图片加载完成就校正，发现deferred用在这儿就已经失去了意义
                //var deferred = $.Deferred();
                //$(this).load(deferred.resolve);
                //
                //image.push(deferred);
                //$.when(image[index]).done(function () {
                //	regulatePosition();
                //});

                $(this).load(regulatePosition);
            });
        }

        //刚进入页面，如果设置了默认定位则定位
        if (defaultIndex >= 0) {
            $sideNavLi.eq(defaultIndex).click();
            perImgLoadPosition();
        }
    };
    /**
     * 地图获取
     * @param path 路径
     * @param todo 回调函数
     */
    tools.getMap =	function (path, todo) {
        $.get(path, function (mapJson) {
            todo(mapJson);
        });
    };

    /**
     * 使用方法：
     *  请用在页面渲染后，且需要聚焦效果的元素要加上class：wait-focus
     */
    global.tools.focus = function() {
        $('body .wait-focus').each(function(index, input){
            var $input = $(input);
            var defaultValue = $input.val();

            $input.on('focus', function() {
                var $this = $(this);
                $this.addClass("compl-border");

                var value = $this.val();
                if(defaultValue === value) {
                    $this.val('');
                }
            });

            $input.on('blur', function () {
                var $this = $(this);
                $this.removeClass("compl-border");

                var value = $this.val();
                if(value.trim() === '') {
                    $this.val(defaultValue);
                }
            });
        });
    };

    /**
     * 图片设置，暂时不使用，待修改
     * @param option
     */
    global.tools.setImg = function(option) {
        $(option.selector + ' img').each(function() {
            var $img = $(this);
            var pHeight = $img.parents('a').eq(0).height();
            var pWidth = $img.parents('a').eq(0).height();

            (function () {
                var list = [], intervalId = null,
                // 用来执行队列
                    tick = function () {
                        var i = 0;
                        for (; i < list.length; i++) {
                            list[i].end ? list.splice(i--, 1) : list[i]();
                        }
                        !list.length && stop();
                    },
                // 停止所有定时器队列
                    stop = function () {
                        clearInterval(intervalId);
                        intervalId = null;
                    };
                return function (url, ready, load, error) {
                    var onready, width, height, newWidth, newHeight,
                        img = new Image();
                    img.src = url;
                    // 如果图片被缓存，则直接返回缓存数据
                    if (img.complete) {
                        ready.call(img);
                        load && load.call(img);
                        return;
                    }
                    width = img.width;
                    height = img.height;
                    // 加载错误后的事件
                    img.onerror = function () {
                        error && error.call(img);
                        onready.end = true;
                        img = img.onload = img.onerror = null;
                    };
                    // 图片尺寸就绪
                    onready = function () {
                        newWidth = img.width;
                        newHeight = img.height;
                        if (newWidth !== width || newHeight !== height || newWidth * newHeight > 1024) {
                            ready.call(img);
                            onready.end = true;
                        }
                    };
                    onready();
                    // 完全加载完毕的事件
                    img.onload = function () {
                        // onload在定时器时间差范围内可能比onready快
                        // 这里进行检查并保证onready优先执行
                        !onready.end && onready();
                        load && load.call(img);
                        // IE gif动画会循环执行onload，置空onload即可
                        img = img.onload = img.onerror = null;
                    };
                    // 加入队列中定期执行
                    if (!onready.end) {
                        list.push(onready);
                        // 无论何时只允许出现一个定时器，减少浏览器性能损耗
                        if (intervalId === null) intervalId = setInterval(tick, 40);
                    }
                };
            })()($img.attr('src'),
                function() {
                }, function() {

                    if( this.width / this.height > pWidth / pHeight ) {
                        $img.css({
                            position: 'relative',
                            width: '100%',
                            height: 'auto'
                        });

                        $img.css({
                            top: '50%',
                            marginTop: '-' + $img.height()/2 + 'px'
                        });
                    } else if(this.width / this.height < pWidth / pHeight ) {
                        $img.css({
                            position: 'relative',
                            width: 'auto',
                            height: '100%'
                        });

                        $img.css({
                            left: '50%',
                            marginLeft: '-' + $img.height()/2 + 'px'
                        });
                    }
                },function() {
                });
        });
    };
    /**
     * 使用方法：
     *  字段的验证，支持非空、手机、邮箱的判断
     */
    global.tools.validate = function(value, type, minlength, maxlength) {
        var value = $.trim(value);
        // 非空验证
        if ('require' === type) {
            return !!value;
        }
        // 手机号验证
        if ('phone' === type) {
            return /^1\d{10}$/.test(value);
        }
        // 邮箱格式验证
        if ('email' === type) {
            return /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(value);
        }
        //验证长度
        if ('length' === type) {
            if (value.length <= minlength || value.length >= maxlength) {
                return false;
            } else {
                return true;
            }
        }
        //汉字和字母验证规则
        if ('chinese' === type) {
            return /^([\u4E00-\uFA29]*[a-z]*[A-Z]*)+$/.test(value);
        }
    };
})(window, jQuery);

/**
 * @authors hexg
 * @date    2017-12-06 09:08:56
 */



var today = new Date();
/**
 * daqCalendar 日历带价格插件
 * @param    url      {url}           请求的链接
 * @param    date     {string||array} 初始时间 string格式：2017-1-10 array格式：['2017-1-10','2017-1-10'] 起止时间
 * @param  	minDate   {string}        拼组团请求日历的时候 最小的可选择时间  '2017-1-10'
 * @param  	maxDate   {string}        拼组团请求日历的时候 最大的可选择时间  '2017-1-10'
 * @param    mode     {string}        日历插件类型 single或者range
 * @param    data     {object}        请求附带的参数
 * @param    change   {function}      插件选中值后的回调
 * @return
 */
window.daqCalendar = (function(){
	var calendar = {
		init: function(trigger, config) {
			this.trigger = $(trigger);
			this.date;
			//配置
			this.config = {
				url: '',
				eventType:'click',
				mode:'single',
				date: '',
				data: {},
				minDate: '',
				maxDate: '',
				change: function(params) {}
			};
			// 默认参数扩展
			if (config && $.isPlainObject(config)) {
				$.extend(this.config, config, true);
			};
			this.date = this.config.date;
			var date;
			if(typeof this.config.date == 'string'){
				date = this.config.date ? this.config.date.split('-') : '';

			} else if(typeof this.config.date == 'object') {
				date = this.config.date[0] ? this.config.date[0].split('-') : '';
				this.startDate = this.date[0];
				this.rangeEndDate = this.date[1];
			}

			if(this.config.minDate){
				today = new Date(this.config.minDate);
			}

			if(date.length === 3){
				this.year = parseInt(date[0]);
				this.month = parseInt(date[1]);
				this.day =parseInt(date[2]);
			}else{
				this.year = today.getFullYear();
				this.month = today.getMonth() + 1;
			}
			this.config.data.month = this.year + '-' + this.formatNumber(this.month);
			if(this.config.maxDate){
				this.endDate = this.config.maxDate.split('-');
			}
			this.eventBind();
		},
		eventBind:function(){
			var config = this.config;
			var _self = this;
			//this.trigger.on(config.eventType,popCalendar);
            popCalendar();
			function popCalendar(){
				$("html").addClass("no-scroll");
				// 渲染dom
				_self.daqCalendar = $('<div class="daqCalendar"></div>');
				// _self.calendarMask = $('<p class="ui-calendar-mask"></p>');
				_self.calendar = $('<div class="ui-calendar"></div>');

				var calendarHtml = '<div class="ui-calendar-hd">' +
										'<span class="prev"><i class="daq-icon">&#xe6b2;</i>上一月</span>' +
										'<h2 class="title">2017年11月</h2>' +
										'<span class="next">下一月<i class="daq-icon">&#xe6b1;</i></span>' +
									'</div>' +
									'<div class="ui-calendar-bd">' +
										'<div class="ui-calendar-bd-bg"></div>' +
										'<table>' +
											'<thead>' +
												'<tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>' +
											'</thead>' +
											'<tbody>' +
												'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
												'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
												'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
												'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
												'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
												'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
											'</tbody>' +
										'</table>' +
									'</div>';
				_self.calendar.html(calendarHtml);
				_self.daqCalendar.append(_self.calendar);

				//$("body").append(_self.daqCalendar);
                $(_self.trigger).html(_self.daqCalendar);
				//_self.calendarMask.on("click",_self.hide);
				_self.btnClick();

				if (_self.year === today.getFullYear() && _self.month === (today.getMonth() + 1)) {
					_self.calendar.find('.prev').addClass('disabled');
				};
				_self.loadCalendar(_self.config);
				_self.formatter();
			}
		},
		// 格式化数字
		formatNumber:function(n) {
			n = parseInt(n);
            return n < 10 ? "0" + n : n;
        },
        //获取最大值到最小值的数组
		initYears:function(max, min) {
			var arr = [];
			for (var i = (min || 1950); i <= (max || 2030); i++) {
				arr.push(i);
			}
			return arr;
		},
		//获取天数
		getDays:function(max) {
			var days = [];
			for (var i = 1; i <= (max || 31); i++) {
				days.push(i < 10 ? "0" + i : i);
			};
			return days;
		},
		//根据月年获取天数
		getDaysByMonthAndYear:function(month, year) {
			var int_d = new Date(year, parseInt(month) + 1 - 1, 1),
				_self = this;
			var d = new Date(int_d - 1);
			return _self.getDays(d.getDate());
		},
		//格式化数字
		formatNumber:function(n) {
			n = parseInt(n);
			return n < 10 ? "0" + n : n;
		},
		//获取星期几
		getWeek: function() {
			return new Date(this.year,this.month-0-1,'01').getDay();
		},
		//上一页
		prev: function() {
			var _self = this;
			if (_self.calendar.find('.next').hasClass('disabled')) {
				_self.calendar.find('.next').removeClass('disabled');
			};
			if (_self.calendar.find('.prev').hasClass('disabled')) {
				return false;
			};
			if (_self.month <= 1) {
				_self.year--;
				_self.month = 12;
			} else {
				_self.month--;
			}
			_self.config.data.month = _self.year + '-' + _self.formatNumber(_self.month);
			_self.loadCalendar(_self.config);
			_self.formatter();

			if (_self.year === today.getFullYear() && _self.month === (today.getMonth() + 1)) {
				_self.calendar.find('.prev').addClass('disabled');
			};
		},
		//下一页
		next: function() {
			var _self = this;
			if (_self.calendar.find('.prev').hasClass('disabled')) {
				_self.calendar.find('.prev').removeClass('disabled');
			};
			if(_self.calendar.find('.next').hasClass('disabled')){
				return false;
			};
			if (_self.month >= 12) {
				_self.year++;
				_self.month = 1;
			} else {
				_self.month++;
			}
			_self.config.data.month = _self.year + '-' + _self.formatNumber(_self.month);
			_self.loadCalendar(_self.config);
			_self.formatter();

			if(_self.year === parseInt(_self.endDate[0]) && _self.month === parseInt(_self.endDate[1])){
				_self.calendar.find('.next').addClass('disabled');
			};
		},
		//格式化
		formatter: function() {
			var _self = this;
			_self.daqCalendar.find(".title").html(_self.year + '年' + _self.formatNumber(_self.month) + '月');
		},
		//加载数据
		loadCalendar: function(param) {
			var $calendar = this.calendar,
				date =param.data.month.split("-");
				_self = this,
				// start = _self.getWeek() === 0 ? 0 : _self.getWeek() - 1,
				$td = $calendar.find('td');
			$td.html('');
			var rp = {
			    url: _self.config.url,
                data: param.data
            }
			tools.request(rp, function (res) {
                if(!_self.endDate) {
                    _self.endDate = res.data.maxDate.split('-');
                }
                var start;
                if(res.data.hasOwnProperty("dataPrices")){
                    start = res.data.dataPrices.first - 1;
                    res= res.data.dataPrices.datePrice;
                } else if(res.data.hasOwnProperty("datePrice")){
                    start = res.data.first - 1;
                    res = res.data.datePrice;
                }
                // start = start === 0 ? start : start -1;
                $calendar.find("td").removeClass("active").removeClass('on');
                _self.removeAttribute();

                var $tds;
                if(start > 0) {
                    start-- ;
                    $tds = $calendar.find('td:gt(' + start + ')');
                } else {
                    $tds = $calendar.find('td');
                }
                $tds.each(function(index, value) {
                    if (index >= res.length) {
                        return false;
                    }

                    $(this).addClass('bg-gray').html('<span class="date">' + res[index]['date'] + '</span><span class="price">' + (res[index].price != -1 ? '￥' + res[index].price : '') + '</span>');
                    if (res[index].price != -1) {
                        $(this).addClass('on').attr('data-price', res[index].price);
                        $(this).attr('data-maxbuy', res[index].maxBuyNum);
                        $(this).attr('data-minbuy', res[index].minBuyNum);
                        $(this).attr('data-getdate', _self.formatNumber(index+1));
                        $(this).attr('data-month',date[1]);
                        $(this).attr('data-year',date[0]);
                        $(this).attr("data-stock",res[index].stock);
                        $(this).attr("data-childPrice",res[index].childPrice);
                    } else {
                        $(this).addClass('bg-gray')
                    }
                });
                _self.addActive();
            })
		},
		// 清除标td标签上的自定义属性
		removeAttribute: function(){
			this.calendar.find("td").each(function(index,el) {
				$(this).removeAttr('data-price');
				$(this).removeAttr('data-maxbuy');
				$(this).removeAttr('data-minbuy');
				$(this).removeAttr('data-getdate');
				$(this).removeAttr('data-month');
				$(this).removeAttr('data-year');
				$(this).removeAttr("data-stock");
				$(this).removeAttr("data-childPrice");
			});
		},
		// 日历销毁
		hide: function(){
			$("html").removeClass("no-scroll");
			$('.daqCalendar').remove();
			this.daqCalendar=null;
			this.calendarMask=null;
			this.calendar = null;
		},
		// 日历按钮点击事件
		btnClick:function(){
			this.clicknum = 0;
			var _self = this;
			//下一月
			_self.daqCalendar.find('.ui-calendar .next').on('click', function() {
				if(_self.year === parseInt(_self.endDate[0]) && _self.month === parseInt(_self.endDate[1])){
					$(this).addClass('disabled')
					return false;
				};
				if($(this).is('.disabled')){
					return false;
				}
				_self.next();
			});
			//上一月
			_self.daqCalendar.find('.ui-calendar .prev').on('click', function() {
				_self.prev();
			});
			// 选择日期
			_self.daqCalendar.on('click','.ui-calendar td.on', function() {
				var $this = $(this);
				if(_self.config.mode=='single'){
					_self.singleOnchage($this);
				} else if(_self.config.mode == 'range'){
					_self.rangeOnchage($this);
				}
			});
		},
		// 单独日期选择
		singleOnchage:function($el){
			var _self = this;
            _self.daqCalendar.find('.ui-calendar td').removeClass('active');
            $el.addClass('active');
			_self.day =  $el.data('getdate');
			_self.month = _self.month > 10 ? _self.month : '0' + parseInt(_self.month)
			_self.date = _self.year + '-' + _self.month + '-' + _self.day;
			typeof _self.config.change === 'function' && _self.config.change({
				year: _self.year,
				month: _self.month,
				price: $el.attr('data-price'),
				minBuy: $el.attr('data-minbuy'),
				maxBuy: $el.attr('data-maxbuy'),
				getDate: $el.attr('data-getdate'),
				stock:$el.attr("data-stock"),
				date:_self.date,
				childPrice:$el.attr("data-childPrice")
			});
			//_self.hide();
		},
		// 日期段选择
		rangeOnchage:function($el) {
			var _self = this;
			var date = $el.attr("data-year") + '-' + $el.attr("data-month") +'-' +$el.attr("data-getdate");
			if(_self.clicknum ==0){
				$td = _self.calendar.find("td");
				$td.removeClass("active");
				$el.addClass("active");
				_self.rangeStart = $el;
				_self.startDate = date;
				$el.attr("data-date",date);
				_self.clicknum ++;
			} if(_self.clicknum ==1 && !$el.is(".active")){
				var dateFlag = _self.compareDate(_self.startDate,date);
				if(dateFlag){
					_self.rangeEndDate = _self.rangeStart.attr("data-date");
					_self.startDate = date;
					_self.rangeStart = $el;
				}else {
					_self.rangeEndDate = date;
				}
				_self.date = [_self.startDate,_self.rangeEndDate];

				typeof _self.config.change === 'function' && _self.config.change({
					price: _self.rangeStart.attr('data-price'),
					minBuy: _self.rangeStart.attr('data-minbuy'),
					maxBuy: _self.rangeStart.attr('data-maxbuy'),
					stock:_self.rangeStart.attr("data-stock"),
					date:_self.date,
					startDate:_self.startDate,
					endDate:_self.rangeEndDate,
					childPrice:_self.rangeStart.attr("data-childPrice")
				});

				_self.clicknum = 0; //重置点击计数器
				//_self.hide();
			}
		},
		/**
		 * [compareDate 比较日期大小]
		 * @param  {string} date1 [日期1]
		 * @param  {string} date2 [日期2]
		 * @return {boolen}       date1>date2 ? true :false
		 */
		compareDate:function(date1,date2){
			var time1 = new Date(date1.replace(/\-/g, "\/")).getTime();
			var time2 = new Date(date2.replace(/\-/g, "\/")).getTime();
			if(time1 > time2){
				return true;
			}else{
				return false;
			}
		},
		// 初始化日历时 为日历对应日期添加选中状态
		addActive:function() {
			var _self = this;
			var $td = _self.calendar.find("td");
			if(_self.config.mode == 'single') {
				var selectDate = _self.date.split("-");
				var selectDay = selectDate[2],
				    selcetMon = selectDate[1],
					selectYear =selectDate[0];
				$td.each(function(index, el) {
					if($(this).attr('data-getdate')-0 === selectDay-0 && selcetMon-0 === $(this).attr('data-month')-0 && selectYear-0 === $(this).attr('data-year')-0){
						$(this).addClass("active");
						return;
					}
				});
				return;
			}  else if(_self.config.mode == 'range') {
				var startDate = _self.startDate.split("-");
				var	endDate = _self.rangeEndDate.split("-");
				var startDay = parseInt(startDate[2]),
				    startMon = parseInt(startDate[1]),
					startYear =parseInt(startDate[0]),
					endDay = parseInt(endDate[2]),
				    endMon = parseInt(endDate[1]),
					endYear =parseInt(endDate[0]);
				$td.each(function(index, el) {
					if( $(this).attr('data-year')/1-startYear >= 0 && endYear- $(this).attr('data-year')/1 >= 0){
						if( $(this).attr('data-month')/1-startMon >= 0 && endMon- $(this).attr('data-month')/1 >= 0){
							if( $(this).attr('data-getdate')/1-startDay >= 0 && endDay- $(this).attr('data-getdate')/1 >= 0){
								$(this).addClass("active");
							}
						}
					}

				});


			}

		}

	};
	return calendar;
})();

(function($) {
	function Dialog(config) {
		this.config = {
			title: '',
			width: 600,
			height: 300,
			message: '出错了',
			footer: true,
			buttons: null,
			logShow: false,
			ready: function(){},
			callback: function(){

			}
		};
		//默认参数扩展
		if (config && $.isPlainObject(config)) {
			$.extend(this.config, config);
		};
		this.init();
	}
	Dialog.prototype.init = function() {
		this.body = $('body');
		//创建弹出窗口
		this.dialogWrap = $('<div class="ui-dialog-wrap"></div>');
		//创建遮罩层
		this.mask = $('<div class="ui-dialog-mask"></div>');
		//创建弹出窗口dialog
		this.dialog = $('<div class="ui-dialog"></div>');
		//创建弹出窗口head
		this.dialogHd = $('<div class="ui-dialog-hd"><span class="ui-dialog-line"></span><h2 class="ui-dialog-title">购买须知</h2><i class="ui-dialog-close">×</i></div>');
		//创建弹出窗口body
		this.dialogBd = $('<div class="ui-dialog-bd"></div>');
		//创建弹出窗口footer
		this.dialogFt = $('<div class="ui-dialog-ft ui-border-t"></div>');
		//渲染DOM
		this.render();
		this.show();
		this.event();
	};
	Dialog.prototype.event = function() {
		var _this = this,
			mask = this.mask;
		$(document).on('click','.ui-dialog-close,.ui-dialog-mask',function(){
			typeof _this.config.callback === 'function' && _this.config.callback();
			_this.hide();
		});
	};
	Dialog.prototype.render = function() {
		var _this = this,
			body = $('body'),
			config = this.config,
			dialogWrap = this.dialogWrap,
			mask = this.mask,
			dialog = this.dialog,
			dialogHd = this.dialogHd,
			dialogBd = this.dialogBd,
			dialogFt = this.dialogFt;

		if (config.mask) {
			dialogWrap.append(mask);
		};
		//如果传了标题
		if (config.title) {
			dialogHd.find('.ui-dialog-title').html(config.title);
			dialog.append(dialogHd);
		};
		//如果传了信息文本
		if (config.message) {
			dialog.append(dialogBd.html(config.message));
		};
		if (config.buttons) {
			_this.creactButton(config.buttons, dialogFt);
			dialog.append(dialogFt);
		}
		if (config.logShow === true){
            setTimeout(function () {
                _this.hide();
            },2000)
        }
		dialogWrap.append(dialog);
		body.append(dialogWrap);
		config.ready && config.ready();
		_this.computed();
	};
	Dialog.prototype.computed = function() {
		var _this = this,
			config = this.config,
			$dialog = $('.ui-dialog'),
			dialogHdHeight = $('.ui-dialog-hd').outerHeight(),
			$dialogBd = $('.ui-dialog-bd'),
			dialogFtHeight = $('.ui-dialog-ft').outerHeight(),
			dialogBdHeight;
		$dialog.css({
			width: config.width,
			height: config.height,
			marginTop: -config.height / 2,
			marginLeft: -config.width / 2
		});

		if (config.footer) {
			dialogBdHeight = config.height - dialogHdHeight - dialogFtHeight - 40
		}else{
			dialogBdHeight = config.height - dialogHdHeight - 40
		}
		$dialogBd.css({
			height: dialogBdHeight
		});
	};
	Dialog.prototype.creactButton = function(buttons, footer) {
		var _this = this,
			config = _this.config;
		$(buttons).each(function() {
			var text = this.text ? this.text : '按钮' + index++,
				callback = this.callback ? this.callback : null;
			button = $('<a class="btn ' + this.className + '">' + text + '</a>');
			if (callback) {
				button.click(function() {
					var isClose = callback();
					if (isClose !== false) {
						_this.hide();
					}
				});
			} else {
				button.click(function() {
					_this.hide();
				});
			}
			if (config.footer) {
				footer.append(button);
			}
		});
	};
	Dialog.prototype.hide = function() {
		var _this = this;
		_this.dialogWrap.removeClass('show').addClass('hide');
		setTimeout(function() {
			_this.dialogWrap.remove();
		}, 250);
	};
	Dialog.prototype.show = function() {
		var _this = this;
		setTimeout(function() {
			_this.dialogWrap.removeClass('hide').addClass('show');
		}, 100);
	};
	window.Dialog = Dialog;
	$.dialog = function(config) {
		return new Dialog(config);
	}
})(window.jQuery || $);

(function(global, $, undefined) {
    'use strict';

    global.tools = global.tools || {};

    /**
     * 图片弹出层
     * @param option
     * {
     *  list: 图片列表选择器，默认为‘#pictureList’
     *  entry: 列表条目选择器，默认为‘li’
     *  img: 图片选择器，默认为‘img.scale-pic’
     *  title: 标题选择器，默认为‘.picture-tit > span’
     * }
     */
    global.tools.popupPicture = function(option, callback) {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        var imgWidth = 0;
        var imgHeight = 0;
        var picIndex = 0;
        var imageSrc = '';
        var title = '';
        var top = 0;
        var left = 0;
        var prevClickTime = 0;
        var list = option.list || '.picture-lst';
        var imgElement = option.img || 'img.scale-pic';
        var titleElement = option.title || '.picture-tit > span';
        var entryElement = option.entry || 'li';
        var viewBtn = option.viewBtn || '';

        $(window).on('resize', function() {
            windowWidth = $(window).width();
            windowHeight = $(window).height();

            computeImgPosition();

            $(".pop-box").css({
                "left" : left,
                "top" : top
            });
        });

        if(viewBtn) {
            //点击图片
            $(list).on('click', viewBtn, function(e) {
                var $li = $(this).parents(entryElement);
                picIndex = $li.index();
                imageSrc = $li.find(imgElement).attr("src");
                title = $li.find(titleElement).text();
                // console.log(title)
                popupLayer();
            });
        } else {
            //点击图片
            $(list).on('click', entryElement, function(e) {
                // console.log($(this))
                picIndex = $(this).index();
                imageSrc = $(this).find(imgElement).attr("src") || $(imgElement).attr("src");
                title = $(this).find(titleElement).text() || $(this).parent().parent().find(titleElement).text();
                // console.log(title)
                popupLayer();
            });
        }

        $('body').on('click', '.picture-popup > .pop-prev', function() {
            //设置500毫秒一次有效点击，防止用户频繁点击
            var clickTime = new Date().getTime();
            if(clickTime - prevClickTime > 500) {
                $('.pop-img > img').attr('style', '');
                prevPic();
                prevClickTime = clickTime;
            }
        });
        $('body').on('click', '.picture-popup > .pop-next', function() {
            var clickTime = new Date().getTime();
            if(clickTime - prevClickTime > 500) {
                $('.pop-img > img').attr('style', '');
                nextPic();
                prevClickTime = clickTime;
            }
        });
        $('body').on('click', '.picture-popup > .pop-remove', function() {
            closePopup();
        });

        function computeImgPosition() {
            imgWidth = $(".pop-img > img").width();
            imgHeight = $(".pop-img > img").height();

            if(imgWidth > 1280){
                imgWidth = 1200;
            } else if(imgWidth < 300){
                imgWidth = 300;
            }

            if(imgHeight > 720){
                imgHeight = 700;
                if(imgHeight > windowHeight) {
                    imgHeight = windowHeight;
                }
            } else if (imgHeight < 175) {
                imgHeight = 175;
            }

            $('.pop-img > img').css({
                "width": imgWidth,
                "height": imgHeight
            });

            left = (windowWidth - imgWidth - 30) / 2;
            top = (windowHeight - imgHeight - 30) / 2;

            callback && callback($(list).find(entryElement).eq(picIndex));
        }

        function popupLayer() {// 图库弹出层
            var layer = '<div class="picture-popup"><div class="opa80 pop-remove"></div>' +
                '<a class="pop-close pop-remove"></a>' +
                '<a class="pop-btn pop-prev"></a>' +
                '<a class="pop-btn pop-next"></a>' +
                '<div class="pop-box"><div class="pop-img"><img src="' + imageSrc + '"/><p class="pop-tit"><span>' + title + '</span></p></div></div>' +
                '</div>';
            $(document.body).append(layer);

            $(".opa80").animate({
                opacity : 1
            }, 500);
            $(".pop-btn").animate({
                opacity : 1
            }, 500);
            $(".pop-close").animate({
                opacity : 1
            }, 500);

            computeImgPosition();

            $(".pop-box").css({
                "top" : top
            });

            $(".pop-box").animate({
                left : left,
                opacity : 1
            }, 500);
        }

        function closePopup() {
            $(".picture-popup").remove();
        }

        //上一张
        function prevPic() {
            var entrys = $(list).find(entryElement);
            var total = entrys.length;

            picIndex -= 1;
            if (picIndex < 0) {
                picIndex = total - 1;
            }
            var $img = $(entrys).eq(picIndex).find(imgElement).attr("src");
            var $tit = $(entrys).eq(picIndex).find(titleElement).html();

            $(".pop-img > img").animate({opacity: 0}, 0).attr("src",$img).animate({opacity: 1}, 200);
            $(".pop-tit > span").animate({opacity: 0}, 0).html($tit).animate({opacity: 1}, 200);

            computeImgPosition();

            $(".pop-box").css({
                "left" : left,
                "top" : top
            });
        }

        //下一张
        function nextPic() {
            var entrys = $(list).find(entryElement);
            var total = entrys.length;

            picIndex += 1;
            if (picIndex >= total) {
                picIndex = 0;
            }

            var $img = $(entrys).eq(picIndex).find(imgElement).attr("src");
            var $tit = $(entrys).eq(picIndex).find(titleElement).html();

            $(".pop-img > img").animate({opacity: 0}, 0).attr("src",$img).animate({opacity: 1}, 200);
            $(".pop-tit > span").animate({opacity: 0}, 0).html($tit).animate({opacity: 1}, 200);

            computeImgPosition();

            $(".pop-box").css({
                "left" : left,
                "top" : top
            });
        }
    }

})(window, jQuery);

/*
 * @Author: UEDHE
 * @Date:   2017-09-18 11:48:44
 * @Last Modified by:   'hejianping'
 * @Last Modified time: 2017-12-13 17:51:52
 */
;
(function($) {
    /**
     * [LightBox description]
     * @param {[String]} element [负节点]
     * @param {[Object]} config  [description]
     * @param {[String]} child [字节点]
     * @param {[String]} prevText [上一页的text]
     * @param {[String]} nextText [下一页的text]
     */
    function LightBox(element, config) {
        this.ele = element;
        this.config = {
            child: '.waterfall-item',
            prevText: '上一页',
            nextText: '下一页',
            callback:function(){

            }
        };
        // 默认参数扩展
        if (config && $.isPlainObject(config)) {
            $.extend(this.config, config);
        };
    };

    LightBox.prototype = {
        init: function() {
            this.eventBind();
        },
        /**
         * [eventBind 事件]
         */
        eventBind: function() {
            var _this = this,
                config = _this.config;
            _this.ele.on('click', config.child, function() {
                var $this = $(this);
                _this.index = $this.index();
                _this.len = _this.ele.find(config.child).length;
                _this.render();
                _this.getparams(_this.index);
            });


        },
        /**
         * [render 模版]
         */
        render: function() {
        	var _this = this;
            var _html = '<div class="dialog">' +
                '<div class="dialog-hd">' +
                '<a href="javascript:;" class="daq-icon">&#xe656;</a>' +
                '</div>' +
                '<div class="dialog-bd"><img src="" /><p class="title mask"></p></div>' +
                '<div class="dialog-ft">' +
                '<a href="javascript:;" class="prev daq-icon opacity">&#xe6b2;</a>' +
                '<a href="javascript:;" class="next daq-icon opacity">&#xe6b1;</a>' +
                '</div>' +
                '<div class="mask"></div>' +
                '</div>';
            $('body').append(_html);
            //上一页
            $('.dialog .prev').on('click', function() {
                _this.prev();
            });
            //下一页
            $('.dialog .next').on('click', function() {
                _this.next();
            });
            //remove
            $('.dialog .mask,.dialog .dialog-hd').on('click', function() {
                _this.hide();
            });
        },
        /**
         * [getparams 获取相应参数]
         * @param  {[Number]} num [当前列]
         */
        getparams: function(num) {
            var _this = this,
                config = _this.config,
                $item = _this.ele.find(config.child).eq(num),
                src = $item.find('img').attr('src'),
                content = $item.find('.title').text(),
                $img = $('.dialog').find('img'),
                $title = $('.dialog').find('.title');
            $img.attr('src', src);
            $title.html(content);
            _this.computeImgPosition($img);
            typeof config.callback === "function" && config.callback($item);
        },
        /**
         * [getparams 计算宽高]
         * @param  {[Object]} num [图片对象]
         */
        computeImgPosition: function(img) {
            $('.dialog .dialog-bd').css('width','auto');
            var winH = $(window).height(),
                winW = $(window).width(),
                imgW = img.width(),
                imgH = img.height(),
                imgScale = imgW / imgH;
            if (imgH >= winH) {
                imgH = winH - 300;
                imgW = parseInt(imgH * imgScale);
            }
            if (imgW >= winW) {
                imgW = winW - 300;
                imgH = parseInt(imgW / imgScale);
            }
            $('.dialog .dialog-bd').css({
                    width: imgW,
                    height: imgH,
                    marginLeft: -(imgW + 20) / 2,
                    marginTop: -(imgH + 20) / 2
                },
                200);
        },
        /**
         * [hide 移除dialog]
         */
        hide: function() {
            $('.dialog').hide(500, function() {
                $(this).remove();
            })
        },
        /**
         * [next 下一页]
         */
        next: function() {
            var _this = this;
            if (_this.index >= _this.len-1) {
                return false;
            };
            _this.index++;
            _this.getparams(_this.index);
        },
        /**
         * [next 上一页]
         */
        prev: function() {
            var _this = this;
            if (_this.index <= 0) {
                return false;
            };
            _this.index--;
            _this.getparams(_this.index);
        }
    }

    // 添加到window对象上
    window.LightBox = LightBox;
    // 封装到jquery对象上去
    $.fn.daqLightBox = function(config) {
        var daqLightBox = new LightBox(this, config);
        daqLightBox.init();
    };
})(window.jQuery || $);

/**
 * @authors hexg
 * @date    2017-12-06 09:08:56
 */



var today = new Date();
/**
 * payCalendar 日历带价格插件
 * @param    url      {url}           请求的链接
 * @param    date     {string||array} 初始时间 string格式：2017-1-10 array格式：['2017-1-10','2017-1-10'] 起止时间
 * @param  	minDate   {string}        拼组团请求日历的时候 最小的可选择时间  '2017-1-10'
 * @param  	maxDate   {string}        拼组团请求日历的时候 最大的可选择时间  '2017-1-10'
 * @param    mode     {string}        日历插件类型 single或者range
 * @param    data     {object}        请求附带的参数
 * @param    change   {function}      插件选中值后的回调
 * @return
 */
window.payCalendar = (function(){
    var calendar = {
        init: function(trigger, config) {
            this.trigger = $(trigger);
            this.date;
            //配置
            this.config = {
                url: '',
                eventType:'click',
                mode:'single',
                date: '',
                data: {},
                minDate: '',
                maxDate: '',
                change: function(params) {}
            };
            // 默认参数扩展
            if (config && $.isPlainObject(config)) {
                $.extend(this.config, config, true);
            };
            this.date = this.config.date;
            var date;
            if(typeof this.config.date == 'string'){
                date = this.config.date ? this.config.date.split('-') : '';

            } else if(typeof this.config.date == 'object') {
                date = this.config.date[0] ? this.config.date[0].split('-') : '';
                this.startDate = this.date[0];
                this.rangeEndDate = this.date[1];
            }

            if(this.config.minDate){
                today = new Date(this.config.minDate);
            }

            if(date.length === 3){
                this.year = parseInt(date[0]);
                this.month = parseInt(date[1]);
                this.day =parseInt(date[2]);
            }else{
                this.year = today.getFullYear();
                this.month = today.getMonth() + 1;
            }
            this.config.data.month = this.year + '-' + this.formatNumber(this.month);
            if(this.config.maxDate){
                this.endDate = this.config.maxDate.split('-');
            }
            this.eventBind();
        },
        eventBind:function(){
            var config = this.config;
            var _self = this;
            //this.trigger.on(config.eventType,popCalendar);
            popCalendar();
            function popCalendar(){
                $("html").addClass("no-scroll");
                // 渲染dom
                _self.payCalendar = $('<div class="payCalendar"></div>');
                // _self.calendarMask = $('<p class="ui-calendar-mask"></p>');
                _self.calendar = $('<div class="ui-calendar"></div>');

                var calendarHtml = '<div class="ui-calendar-hd">' +
                    '<span class="prev"><i class="daq-icon">&#xe6b2;</i>上一月</span>' +
                    '<h2 class="title">2017年11月</h2>' +
                    '<span class="next">下一月<i class="daq-icon">&#xe6b1;</i></span>' +
                    '</div>' +
                    '<div class="ui-calendar-bd">' +
                    '<div class="ui-calendar-bd-bg"></div>' +
                    '<table>' +
                    '<thead>' +
                    '<tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr>' +
                    '</thead>' +
                    '<tbody>' +
                    '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
                    '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
                    '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
                    '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
                    '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
                    '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>' +
                    '</tbody>' +
                    '</table>' +
                    '</div>';
                _self.calendar.html(calendarHtml);
                _self.payCalendar.append(_self.calendar);

                //$("body").append(_self.payCalendar);
                $(_self.trigger).html(_self.payCalendar);
                //_self.calendarMask.on("click",_self.hide);
                _self.btnClick();

                if (_self.year === today.getFullYear() && _self.month === (today.getMonth() + 1)) {
                    _self.calendar.find('.prev').addClass('disabled');
                };
                _self.loadCalendar(_self.config);
                _self.formatter();
            }
        },
        // 格式化数字
        formatNumber:function(n) {
            n = parseInt(n);
            return n < 10 ? "0" + n : n;
        },
        //获取最大值到最小值的数组
        initYears:function(max, min) {
            var arr = [];
            for (var i = (min || 1950); i <= (max || 2030); i++) {
                arr.push(i);
            }
            return arr;
        },
        //获取天数
        getDays:function(max) {
            var days = [];
            for (var i = 1; i <= (max || 31); i++) {
                days.push(i < 10 ? "0" + i : i);
            };
            return days;
        },
        //根据月年获取天数
        getDaysByMonthAndYear:function(month, year) {
            var int_d = new Date(year, parseInt(month) + 1 - 1, 1),
                _self = this;
            var d = new Date(int_d - 1);
            return _self.getDays(d.getDate());
        },
        //格式化数字
        formatNumber:function(n) {
            n = parseInt(n);
            return n < 10 ? "0" + n : n;
        },
        //获取星期几
        getWeek: function() {
            return new Date(this.year,this.month-0-1,'01').getDay();
        },
        //上一页
        prev: function() {
            var _self = this;
            if (_self.calendar.find('.next').hasClass('disabled')) {
                _self.calendar.find('.next').removeClass('disabled');
            };
            if (_self.calendar.find('.prev').hasClass('disabled')) {
                return false;
            };
            if (_self.month <= 1) {
                _self.year--;
                _self.month = 12;
            } else {
                _self.month--;
            }
            _self.config.data.month = _self.year + '-' + _self.formatNumber(_self.month);
            _self.loadCalendar(_self.config);
            _self.formatter();

            if (_self.year === today.getFullYear() && _self.month === (today.getMonth() + 1)) {
                _self.calendar.find('.prev').addClass('disabled');
            };
        },
        //下一页
        next: function() {
            var _self = this;
            if (_self.calendar.find('.prev').hasClass('disabled')) {
                _self.calendar.find('.prev').removeClass('disabled');
            };
            if(_self.calendar.find('.next').hasClass('disabled')){
                return false;
            };
            if (_self.month >= 12) {
                _self.year++;
                _self.month = 1;
            } else {
                _self.month++;
            }
            _self.config.data.month = _self.year + '-' + _self.formatNumber(_self.month);
            _self.loadCalendar(_self.config);
            _self.formatter();

            if(_self.year === parseInt(_self.endDate[0]) && _self.month === parseInt(_self.endDate[1])){
                _self.calendar.find('.next').addClass('disabled');
            };
        },
        //格式化
        formatter: function() {
            var _self = this;
            _self.payCalendar.find(".title").html(_self.year + '年' + _self.formatNumber(_self.month) + '月');
        },
        //加载数据
        loadCalendar: function(param) {
            var $calendar = this.calendar,
                date =param.data.month.split("-");
            _self = this,
                // start = _self.getWeek() === 0 ? 0 : _self.getWeek() - 1,
                $td = $calendar.find('td');
            $td.html('');
            var rp = {
                url: _self.config.url,
                data: param.data
            }
            tools.request(rp, function (res) {
                if(!_self.endDate) {
                    _self.endDate = res.data.maxDate.split('-');
                }
                var start;
                if(res.data.hasOwnProperty("dataPrices")){
                    start = res.data.dataPrices.first - 1;
                    res= res.data.dataPrices.datePrice;
                } else if(res.data.hasOwnProperty("datePrice")){
                    start = res.data.first - 1;
                    res = res.data.datePrice;
                }
                // start = start === 0 ? start : start -1;
                $calendar.find("td").removeClass("active").removeClass('on');
                _self.removeAttribute();

                var $tds;
                if(start > 0) {
                    start-- ;
                    $tds = $calendar.find('td:gt(' + start + ')');
                } else {
                    $tds = $calendar.find('td');
                }
                $tds.each(function(index, value) {
                    if (index >= res.length) {
                        return false;
                    }

                    $(this).addClass('bg-gray').html('<span class="date">' + res[index]['date'] + '</span><span class="price">' + (res[index].price != -1 ? '￥' + res[index].price : '') + '</span>');
                    if (res[index].price != -1) {
                        $(this).addClass('on').attr('data-price', res[index].price);
                        $(this).attr('data-maxbuy', res[index].maxBuyNum);
                        $(this).attr('data-minbuy', res[index].minBuyNum);
                        $(this).attr('data-getdate', _self.formatNumber(index+1));
                        $(this).attr('data-month',date[1]);
                        $(this).attr('data-year',date[0]);
                        $(this).attr("data-stock",res[index].stock);
                        $(this).attr("data-childPrice",res[index].childPrice);
                    } else {
                        $(this).addClass('bg-gray')
                    }
                });
                _self.addActive();
            })
        },
        // 清除标td标签上的自定义属性
        removeAttribute: function(){
            this.calendar.find("td").each(function(index,el) {
                $(this).removeAttr('data-price');
                $(this).removeAttr('data-maxbuy');
                $(this).removeAttr('data-minbuy');
                $(this).removeAttr('data-getdate');
                $(this).removeAttr('data-month');
                $(this).removeAttr('data-year');
                $(this).removeAttr("data-stock");
                $(this).removeAttr("data-childPrice");
            });
        },
        // 日历销毁
        hide: function(){
            $("html").removeClass("no-scroll");
            $('.payCalendar').remove();
            this.payCalendar=null;
            this.calendarMask=null;
            this.calendar = null;
        },
        // 日历按钮点击事件
        btnClick:function(){
            this.clicknum = 0;
            var _self = this;
            //下一月
            _self.payCalendar.find('.ui-calendar .next').on('click', function() {
                if(_self.year === parseInt(_self.endDate[0]) && _self.month === parseInt(_self.endDate[1])){
                    $(this).addClass('disabled')
                    return false;
                };
                if($(this).is('.disabled')){
                    return false;
                }
                _self.next();
            });
            //上一月
            _self.payCalendar.find('.ui-calendar .prev').on('click', function() {
                _self.prev();
            });
            // 选择日期
            _self.payCalendar.on('click','.ui-calendar td.on', function() {
                var $this = $(this);
                if(_self.config.mode=='single'){
                    _self.singleOnchage($this);
                } else if(_self.config.mode == 'range'){
                    _self.rangeOnchage($this);
                }
            });
        },
        // 单独日期选择
        singleOnchage:function($el){
            var _self = this;
            _self.payCalendar.find('.ui-calendar td').removeClass('active');
            $el.addClass('active');
            _self.day =  $el.data('getdate');
            _self.month = _self.month > 10 ? _self.month : '0' + parseInt(_self.month)
            _self.date = _self.year + '-' + _self.month + '-' + _self.day;
            typeof _self.config.change === 'function' && _self.config.change({
                year: _self.year,
                month: _self.month,
                price: $el.attr('data-price'),
                minBuy: $el.attr('data-minbuy'),
                maxBuy: $el.attr('data-maxbuy'),
                getDate: $el.attr('data-getdate'),
                stock:$el.attr("data-stock"),
                date:_self.date,
                childPrice:$el.attr("data-childPrice")
            });
            //_self.hide();
        },
        // 日期段选择
        rangeOnchage:function($el) {
            var _self = this;
            var date = $el.attr("data-year") + '-' + $el.attr("data-month") +'-' +$el.attr("data-getdate");
            if(_self.clicknum ==0){
                $td = _self.calendar.find("td");
                $td.removeClass("active");
                $el.addClass("active");
                _self.rangeStart = $el;
                _self.startDate = date;
                $el.attr("data-date",date);
                _self.clicknum ++;
            } if(_self.clicknum ==1 && !$el.is(".active")){
                var dateFlag = _self.compareDate(_self.startDate,date);
                if(dateFlag){
                    _self.rangeEndDate = _self.rangeStart.attr("data-date");
                    _self.startDate = date;
                    _self.rangeStart = $el;
                }else {
                    _self.rangeEndDate = date;
                }
                _self.date = [_self.startDate,_self.rangeEndDate];

                typeof _self.config.change === 'function' && _self.config.change({
                    price: _self.rangeStart.attr('data-price'),
                    minBuy: _self.rangeStart.attr('data-minbuy'),
                    maxBuy: _self.rangeStart.attr('data-maxbuy'),
                    stock:_self.rangeStart.attr("data-stock"),
                    date:_self.date,
                    startDate:_self.startDate,
                    endDate:_self.rangeEndDate,
                    childPrice:_self.rangeStart.attr("data-childPrice")
                });

                _self.clicknum = 0; //重置点击计数器
                //_self.hide();
            }
        },
        /**
         * [compareDate 比较日期大小]
         * @param  {string} date1 [日期1]
         * @param  {string} date2 [日期2]
         * @return {boolen}       date1>date2 ? true :false
         */
        compareDate:function(date1,date2){
            var time1 = new Date(date1.replace(/\-/g, "\/")).getTime();
            var time2 = new Date(date2.replace(/\-/g, "\/")).getTime();
            if(time1 > time2){
                return true;
            }else{
                return false;
            }
        },
        // 初始化日历时 为日历对应日期添加选中状态
        addActive:function() {
            var _self = this;
            var $td = _self.calendar.find("td");
            if(_self.config.mode == 'single') {
                var selectDate = _self.date.split("-");
                var selectDay = selectDate[2],
                    selcetMon = selectDate[1],
                    selectYear =selectDate[0];
                $td.each(function(index, el) {
                    if($(this).attr('data-getdate')-0 === selectDay-0 && selcetMon-0 === $(this).attr('data-month')-0 && selectYear-0 === $(this).attr('data-year')-0){
                        $(this).addClass("active");
                        return;
                    }
                });
                return;
            }  else if(_self.config.mode == 'range') {
                var startDate = _self.startDate.split("-");
                var	endDate = _self.rangeEndDate.split("-");
                var startDay = parseInt(startDate[2]),
                    startMon = parseInt(startDate[1]),
                    startYear =parseInt(startDate[0]),
                    endDay = parseInt(endDate[2]),
                    endMon = parseInt(endDate[1]),
                    endYear =parseInt(endDate[0]);
                $td.each(function(index, el) {
                    if( $(this).attr('data-year')/1-startYear >= 0 && endYear- $(this).attr('data-year')/1 >= 0){
                        if( $(this).attr('data-month')/1-startMon >= 0 && endMon- $(this).attr('data-month')/1 >= 0){
                            if( $(this).attr('data-getdate')/1-startDay >= 0 && endDay- $(this).attr('data-getdate')/1 >= 0){
                                $(this).addClass("active");
                            }
                        }
                    }

                });


            }

        }

    };
    return calendar;
})();
/**
 * Created by 龚小虎 on 2018/8/21.
 */

/**
 * Created by chengwb on 2016/11/8.
 */
(function(global, $, undefined){
    global.tools = global.tools || {};

    /**
     * 翻页；可以使用，待后续优化；
     * @param option
     * {
     *  selector: 翻页的容器选择器，默认值为'.page'
     *  total: 总页数
     *  currPage: 当前页数
     *  homeClass: 首页按钮样式class，默认为'first-page'
     *  lastClass: 尾页按钮样式class，默认为'last-page'
     *  nextClass: 下一页按钮样式class，默认为'page-down'
     *  prevClass: 上一页按钮样式class，默认为'page-up'
     *  click: 页码点击事件处理方法
     *  params: 点击事件处理方法的参数
     * }
     */
    global.tools.pageTurn = function(option) {
        var totalPages = option.total;
        var currPage = option.currPage;
        var homeClass = option.homeClass || 'first-page';
        var lastClass = option.lastClass || 'last-page';
        var nextClass = option.nextClass || 'page-down';
        var prevClass = option.prevClass || 'page-up';
        var container = option.selector || '.page';
        var params = option.params || {};

        //一个多面存在多个翻页时，点击事件避免覆盖
        global._pageTurnClick = global._pageTurnClick || [];
        global._pageTurnClick.push(option.click);

        if(!totalPages || !currPage || totalPages <= 0 || currPage <= 0){
            return;
        }

        if(currPage > totalPages) {
            currPage = totalPages;
        }

        var html = '';
        var home = currPage === 1 ? 0 : 1;
        var prev = currPage === 1 ? 0 : currPage - 1;
        var last = currPage === totalPages ? 0 : totalPages;
        var next = currPage === totalPages ? 0 : currPage + 1;
        var limits = option.limits || 3;//单边限制，设置为n则最多显示2n-1项
        var pageNum = 0;
        var i = 0;

        //限制1-5，默认为3
        if(limits <= 0) {
            limits = 1;
        } else if(limits > 5) {
            limits = 5;
        }

        //生成onclick字符串
        function isClick(page) {
            if(page && page !== currPage) {
                params.page = page;
                return ' valid" onclick="_pageTurnClick[' + (global._pageTurnClick.length-1) + '](' + JSON.stringify(params).replace(/"/g, '\'')  + ')"';
            } else {
                params.page = 0;
                return ' invalid"';
            }
        }

        //翻页的首部
        html += '<a class="' + homeClass + isClick(home) + '>首页</a>';
        html += '<a class="' + prevClass + isClick(prev) + '>上一页</a>';

        //翻页中间部分处理
        if(totalPages >= limits * 2 - 1) {//总页数大于等于总显示数时
            if (currPage - limits > 0) {
                html += '<a class="invalid" style="font-weight: bold;">...</a>';
            }

            if(totalPages - limits >= currPage) {//
                var counts = 0;
                for (i = limits - 1; i >= 0; i--) {
                    pageNum = currPage - i;
                    if (pageNum <= 0) {
                        counts++;
                        html += '<a class="' + (counts === currPage ? 'curr' : '') + isClick(counts) + '>' + counts + '</a>';
                    } else {
                        html += '<a class="' + (pageNum + counts === currPage ? 'curr' : '') + isClick(pageNum + counts) + '>' + (pageNum + counts) + '</a>';
                    }
                }

                for (i = 1; i < limits; i++) {
                    pageNum = (counts === 0 ? currPage + i : limits + i);
                    if (pageNum > totalPages) {
                        break;
                    } else {
                        html += '<a class="' + isClick(pageNum) + '>' + pageNum + '</a>';
                    }
                }

                if (counts + currPage + limits <= totalPages) {
                    html += '<a class="invalid" style="font-weight: bold;">...</a>';
                }
            } else {
                for (i = totalPages - (limits * 2 - 2); i <= totalPages; i++) {
                    html += '<a class="' + (currPage === i ? 'curr' : '') + isClick(i) + '>' + i + '</a>';
                }
            }
        } else {//总页数小于总显示数时
            for (i = 1; i <= totalPages; i++) {
                html += '<a class="' + (currPage === i ? 'curr' : '') + isClick(i) + '>' + i + '</a>';
            }
        }

        //翻页尾部
        html += '<a class="' + nextClass + isClick(next) + '>下一页</a>';
        html += '<a class="' + lastClass + isClick(last) + '>末页</a>';

        $(container).html(html);
        if(window._bd_share_main){
            window._bd_share_main.init();
        }

    };
})(window, jQuery);

/**
 * Created by 何小贵 on 2018/8/13.
 */
(function() {
    /**
     * @param  {[String]} 		url
     * @param  {[Bolean]}		type // 是否是电商接口
     * @param  {object}		    params // 是否是电商接口
     * @param  {[Object]}		template  // 模板对象
     * @param  {[Object]}      noDataTmpl // 没有数据加载的模板  默认添加暂无数据提示
     * @param  {[Bolean]}		pagination // 是否分页 默认不分页
     * @param  {[Number]}		size   //每页条数
     * @param  {[Number]}		curr  // 请求的第几页
     * @param  {function}		callback  // data处理 可不传
     * @param  {function}		complete  // 加载完页面之后的执行方法
     * @param  {function}		error  // 请求出错的执行的方法
     */
    function RenderHtml(element, config) {
        this.ele = element;
        this.nodataTxt = '暂无数据！';
        this.refreshTxt = '获取服务器数据失败，请尝试刷新浏览器页面！';
        this.config = {
            url: '',
            type: false,
            template: {},
            pagination: false,
            total: 0, // 总页数
            size: 1, // 单页数量
            curr: 1, // 当前页
            page: 1, // 初始请求第几页
            loading: false,
            params: {}
            //callback: function(res) {},
            //complete: function(res) {},
            //error: function(res){}
        };
        // 默认参数扩展
        if (config && $.isPlainObject(config)) {
            $.extend(this.config, config);
        }
    }
    RenderHtml.prototype = {
        /**
         * 初始化
         */
        init: function() {
            var _this = this,
                config = _this.config;
            if (config.pagination) {
                _this.page = $('<div class="page js_page"></div>');
                //判断是否有分页
                if ($('.js_page').length >= 1) {
                    $('.js_page').remove();
                }
                _this.ele.after(_this.page);
                _this.flag = true;
                config.params.page = config.curr;
                config.params.limitPage = config.size;
                _this.loadRender(config.params);
            } else {
                config.params.page = config.curr;
                config.params.limitPage = config.size;
                _this.loadRender(config.params);
            }
        },
        /**
         * 加载模版
         * @param  {[Object]}  params
         * @return {[Undefind]}
         */
        loadRender: function(params) {
            var _this = this,
                config = _this.config;
            _this.ele.empty();
            var questParam = {
                url: config.url,
                type: config.type,
                data: params
            };
            if(config.loading) {
                var loading = tools.loading(_this.ele);
            }
            tools.request(questParam, function(res){
                if(config.loading) {
                    loading.clean();
                }
                if (res.code === 0) {
                    var data = res.datas || res.data;
                    if (config.callback && typeof config.callback === 'function') {
                        data = config.callback(data);
                    }
                    if (res.page && config.pagination) {
                        _this.config.curr = res.page.currPage;
                        _this.config.size = res.page.pageSize;
                        _this.config.total = res.page.totalPage;
                        _this.loadPage();
                    }
                    //是数组
                    if ($.isArray(data)) {
                        if (!data.length) {
                            if(_this.ele.is('ul')){
                                _this.ele.append('<li class="no-data">'+ _this.nodataTxt +'</li>');
                            } else {
                                if(config.noDataTmpl) {
                                    config.noDataTmpl.tmpl().appendTo(_this.ele);
                                } else {
                                    _this.ele.append('<div class="no-data">'+ _this.nodataTxt +'</div>');
                                }
                            }
                        } else {
                            config.template.tmpl({list: data}).appendTo(_this.ele);
                        }
                    } else { // 不是数组
                        config.template.tmpl({data: data}).appendTo(_this.ele);
                    }
                    setTimeout(function(){
                        config.complete && config.complete(res);
                    });
                } else if (res.code === 2) {
                    tools.doLogin();
                } else {
                    config.error && config.error();
                    if(_this.ele.is('ul')){
                        _this.ele.append('<li class="no-data">'+ res.message +'</li>');
                    } else {
                        _this.ele.append('<div class="no-data">'+ res.message +'</div>');
                    }
                }
            });
        },
        /**
         * 加载分页
         * @return {Undefind}
         */
        loadPage: function() {
            var _this = this,
                config = _this.config;
            if (config.pagination) {
                var option = {
                   total: config.total,
                   currPage: config.curr,
                   click: function (data) {
                       config.params.page = data.page;
                       $(window).scrollTop(0);
                       _this.loadRender(config.params);
                   }
               };
               tools.pageTurn(option);
            }
        }
    };
    // 添加到window对象上
    window.RenderHtml = RenderHtml;
    //封装到jquery对象上去
    $.fn.renderHtml = function(config) {
        var renderHtml = new RenderHtml(this, config);
        return renderHtml.init();
    }
})(window.jQuery || $);

/* Created by 何小贵 on 2018/8/28.
 */
(function() {
    /**
     * @param  {[String]}       url
     * @param  {[Bolean]}       type // 是否是电商接口
     * @param  {object}         params // 是否是电商接口
     * @param  {[Object]}       template  // 模板对象
     * @param  {[Object]}      noDataTmpl // 没有数据加载的模板  默认添加暂无数据提示
     * @param  {[Bolean]}       pagination // 是否分页 默认不分页
     * @param  {[Number]}       size   //每页条数
     * @param  {[Number]}       curr  // 请求的第几页
     * @param  {function}       callback  // data处理 可不传
     * @param  {function}       complete  // 加载完页面之后的执行方法
     * @param  {function}       error  // 请求出错的执行的方法
     */
    function RoolLoading (element, config) {
        this.ele = element;
        this.nodataTxt = '暂无数据！';
        this.refreshTxt = '获取服务器数据失败，请尝试刷新浏览器页面！';
        this.isScroll = false;
        this.isFirstLoad = true;
        this.config = {
            url: '',
            type: false,
            template: {},
            total: 0, // 总页数
            size: 1, // 单页数量
            curr: 1, // 当前页
            page: 1, // 初始请求第几页
            columnWidth: 0, // 单个宽度
            waterFallEle: '',
            padding: 0,
            loading: false,
            params: {}
            // callback: function(res) {},
            // complete: function(res) {},
            // error: function(res){}
        };
        // 默认参数扩展
        if (config && $.isPlainObject(config)) {
            $.extend(this.config, config);
        }
    }
    RoolLoading.prototype = {
        /**
         * 初始化
         */
        init: function() {
            var _this = this,
                config = _this.config;
            config.params.page = config.curr;
            config.params.limitPage = config.size;

            _this.isScroll = false;

            //计算高度
            _this.arrHeight = [];
            var width = _this.ele.outerWidth(true);
            //计算每行最多放多少列
            if(config.columnWidth){
                _this.num = Math.floor(width / config.columnWidth);
                _this.margin = Math.floor((width - _this.num * config.columnWidth) / (_this.num - 1));
                config.columnWidth = config.columnWidth - config.padding * 2;
            }

            _this.loadRender(config.params);
            _this.scrollEvent(); //滚动加载事件判断
        },
        /**
         * [getMinHeight 获取最小高度的下标]
         * @param  {[Object]} arr [_this.arrHeight]
         * @return {Number} [最小高度的下标]
         */
        getMinHeight: function(arr) {
            var minHeight = Math.min.apply(null, arr);
            for (var i in arr) {
                if (arr[i] === minHeight) {
                    return i;
                }
            }
        },
        // 滚动事件
        scrollEvent: function(){
            var _this = this;
            var scrollTimer;
            $(window).off("scroll").on("scroll",function(){
                scrollTimer = setTimeout(scrollFun,100);
            });
            function scrollFun() {
                clearTimeout(scrollTimer);
                var scrollTop = $(this).scrollTop();    //滚动条距离顶部的高度
                var scrollHeight = $(document).height();   //当前页面的总高度
                var clientHeight = $(this).height();    //当前可视的页面高度
                if( scrollHeight <= scrollTop + clientHeight + 100){   //距离顶部+当前高度 >=文档总高度 即代表滑动到底部
                    if(!_this.isScroll){
                        $(window).off("scroll");
                        return false;
                    }
                    _this.config.curr++;
                    var config = _this.config;
                    if(config.curr <= config.total) {
                        config.params.page = config.curr;
                        config.params.limitPage = config.size;
                        _this.loadRender(config.params);
                    } else {
                        _this.addNoMoreData();
                    }
                    _this.isScroll=false;
                }
            }
        },
        addNoMoreData: function(){
            var _this = this;
            if(_this.ele.is('ul')){
                _this.ele.append('<li class="no-more">已经到底了</li>');
            } else {
                _this.ele.append('<div class="no-more">已经到底了</div>');
            }
        },
        /**
         * 加载模版
         * @param  {[Object]}  params
         * @return {[Undefind]}
         */
        loadRender: function(params) {
            var _this = this,
                config = _this.config;
            var questParam = {
                url: config.url,
                type: config.type,
                data: params
            };
            if(config.params.page === 1) {
                _this.ele.empty();
                _this.ele.prop('style', '');
            }
            if(config.loading) {
                var loading = tools.loading(_this.ele, 'after');
            }
            tools.request(questParam, function(res){
                if(config.loading) {
                    loading.clean();
                }
                if (res.code === 0) {
                    var data = res.datas || res.data;
                    if (config.callback && typeof config.callback === 'function') {
                        data = config.callback(data);
                    }
                    if (res.page) {
                        if( res.page.currPage < res.page.totalPage) {
                            _this.isScroll = true;
                        } else {
                            _this.isScroll = false;
                            _this.addNoMoreData();
                        }
                        _this.config.curr = res.page.currPage;
                        _this.config.size = res.page.pageSize;
                        _this.config.total = res.page.totalPage;
                    }
                    //是数组
                    if ($.isArray(data)) {
                        if (!data.length) {
                            if(_this.ele.is('ul')){
                                _this.ele.append('<li class="no-data">'+ _this.nodataTxt +'</li>');
                            } else {
                                if(config.noDataTmpl) {
                                    config.noDataTmpl.tmpl().appendTo(_this.ele);
                                } else {
                                    _this.ele.append('<div class="no-data">'+ _this.nodataTxt +'</div>');
                                }
                            }
                        } else {
                            config.template.tmpl({list: data}).appendTo(_this.ele);
                        }
                    } else { // 不是数组
                        config.template.tmpl({data: data}).appendTo(_this.ele);
                    }
                    if(_this.config.waterFallEle){
                        setTimeout(function(){
                            _this.waterFall();
                        });
                    }
                    config.complete && config.complete(res);
                } else if (res.code === 2) {
                    tools.doLogin();
                } else {
                    config.error && config.error();
                    if(_this.ele.is('ul')){
                        _this.ele.append('<li class="no-data">'+ res.message +'</li>');
                    } else {
                        _this.ele.append('<div class="no-data">'+ res.message +'</div>');
                    }
                }
            });
        },
        waterFall: function(){
            var _this = this;
            //获取列表
            var $items = _this.ele.find(_this.config.waterFallEle).fadeIn(500);
            var config = _this.config;
            //遍历列表
            $items.each(function(index, dom) {
                if (index < _this.num) {
                    _this.arrHeight[index] = ($(dom).outerHeight(true));
                    //添加样式
                    $(dom).css({
                        'width': config.columnWidth,
                        'left': config.columnWidth * index + _this.margin * (index % _this.num) + config.padding * 2 * (index % _this.num),
                        'top': 0
                    });
                } else {
                    //计算最小高的下标
                    var min = _this.getMinHeight(_this.arrHeight);
                    //添加样式
                    $(dom).css({
                        'width': config.columnWidth,
                        'left': config.columnWidth * min + _this.margin * (min % _this.num) + config.padding * 2 * (index % _this.num),
                        'top': _this.arrHeight[min]
                    });
                    _this.arrHeight[min] += $(dom).outerHeight(true);
                };
            });
            //填充盒子的高度
            _this.ele.css('padding-top', Math.max.apply(null, _this.arrHeight) + 20);
        }
    };
    // 添加到window对象上
    window.RoolLoading = RoolLoading;
    //封装到jquery对象上去
    $.fn.roolLoading = function(config) {
        var roolLoading = new RoolLoading(this, config);
        return roolLoading.init();
    }
})(window.jQuery || $);

/**
 * Created by 何小贵 on 2018/8/17.
 */
;(function($){
    function Toast(config){
        this.config = {
            text:'我是toast提示',
            icon:'',
            delay : 3000
        };
        //默认参数扩展
        if(config && $.isPlainObject(config)){
            $.extend(this.config , config);
        };
        this.init();
    }
    Toast.prototype.init = function(){
        var _this = this;
        _this.body 		= $('body');
        _this.toastWrap = $('<div class="ui-toast">');
        _this.toastIcon = $('<i class="icon"></i>');
        _this.toastText = $('<span class="ui-toast-text">' + _this.config.text + '</span>');

        _this._creatDom();
        _this.show();
        _this.hide();
    };
    Toast.prototype._creatDom = function(){
        var _this = this;
        if(_this.config.icon){
            _this.toastWrap.append(_this.toastIcon.addClass(_this.config.icon));
        }
        _this.toastWrap.append(_this.toastText);
        _this.body.append(_this.toastWrap);
    };
    Toast.prototype.show = function(){
        var _this = this;
        setTimeout(function(){
            _this.toastWrap.removeClass('hide').addClass('show');
        },50);
    };
    Toast.prototype.hide = function(){
        var _this = this;
        setTimeout(function(){
            _this.toastWrap.removeClass('show').addClass('hide');
            _this.toastWrap.remove();
        },_this.config.delay);
    };

    window.Toast=Toast;
    $.toast=function(config){
        return new Toast(config);
    }
})(window.jQuery || $);

/**
 * Created by ts on 2016/12/20.
 * 备注：
 *  命名规则：函数的名称应该使用动词+名词，变量名则最好使用名词。
 *      常量区变量请全部用大写字母,且单词间用下划线链接；
 *      方法名、普通变量名请使用小驼峰命名规则，即除了第一个单词的首字母外其余单词首字母大写。
 */
(function (global, $, undefined) {
    global.tools = global.tools || {};


    /***********************************************************
     *********************** 方法区 *****************************
     **********************************************************/
    // 获取url参数
    global.tools.getQueryString = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    };
    global.tools.getUrlParams = function (name) {
        return  global.tools.getQueryString(name);
    };
    /**
     * 密码加密
     * @param option
     */
    global.tools.AESEncrypt = function(word){
        var key = CryptoJS.enc.Utf8.parse("AQ4S10D7d9K8c64D");
        var iv = CryptoJS.enc.Utf8.parse('dwvNVXzyXiq37u-A');
        var srcs = CryptoJS.enc.Utf8.parse(word);
        var encrypted = CryptoJS.AES.encrypt(srcs, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7});
        return encrypted.toString();
    };
    /**
     * 储存cookie
     * @param option
     */
    global.tools.setCookie = function(cookieData){
        var date = new Date();
        if (cookieData.hour) {
            date.setTime(date.getTime() + cookieData.hour * 60 * 60 * 1000);
            var expires = ";expires=" + date.toGMTString();
        } else {
            date.setTime(date.getTime() + cookieData.day * 24 * 60 * 60 * 1000);
            var expires = ";expires=" + date.toGMTString();
        }
        document.cookie = cookieData.name + "=" + cookieData.value + expires + "; path=/";
    };
    /**
     * 读取cookie
     * @param option
     */
    global.tools.getCookie = function(name){
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg)) {
            return unescape(arr[2]);
        } else {
            return null;
        }
    };
    /**
     * 删除cookie
     * @param option
     */
    global.tools.delCookie = function(name){
        this.setCookie({
            name: name,
            value: '',
            day: -20
        })
    };
    /**
     * 获取配置信息
     */
    global.tools.config = {}
    global.tools.getConfig = function (call) {
        var sendParams = {
            url: '/config/config',
            data: {}
        };
        tools.request(sendParams, function (data) {
            call&&call(data)
            tools.config = data
        });
    };
    /**
     * praise=点赞，want=想去，gone=住过/去过统一交互接口
     * @DateTime  2017-3-13T14:58:41+0800
     * @param  {object}  options      所有参数
     * @params {string}  selector     操作选择器
     * @params {string}  type         praise=点赞，want=想去，gone=住过/去过
     * @params {string}  resourceType 直接通过路径指定 {resourceType} picture=图片，
     * @params {string}  resourceType video=视频，hotel=宾馆酒店，goods=旅游商品，news=新闻资讯，scenery=景区
     * @params {number}  total        操作总数
     * @params {number}  resourceId   id
     * @params {number}  lang         语言参数
     */
    var currentId;
    var currentArray = [];
    tools.getInteraction= function(options){
        var $selector = options.selector;
        var error = "失败";
        var hasDo = "已操作";
        if(currentId != options.reId && $.inArray(options.reId,currentArray) == -1){
            currentId = options.resourceId;
            currentArray.push(options.resourceId);
            var params = {
                url : "thumb/saveThumb",
                data:options
            };
            if(options.token){
                tools.request(params,function(data){
                    if(options.total == ""){
                        options.total = 0;
                    }
                    if(data.code == 0){//第一次操作
                        $selector.find("p").html("点赞("+(Number(options.total) +1)+")");
                        $selector.append('<em class="click_tips" style="position: absolute">+1</em>');
                        $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                            $(this).remove();
                        });

                    }else if(data.code == 1){//操作失败
                        $selector.append('<em class="click_tips" style="position: absolute">'+data.message+'</em>');
                        $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                            $(this).remove();
                        });
                    }else{//已操作
                        $selector.append('<em class="click_tips" style="position: absolute">'+hasDo+'</em>');
                        $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                            $(this).remove();
                        });
                    }


                });
            }else {
                window.location.href = "login.html";
            }


        }else{
            $selector.append('<em class="click_tips" style="position: absolute">'+hasDo+'</em>');
            $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                $(this).remove();
            });
            return;
        }

    };
    //t推荐
    tools.getRecommend= function(options){
        var $selector = options.selector;
        var error = "失败";
        var hasDo = "已操作";
        if(currentId != options.reId && $.inArray(options.reId,currentArray) == -1){
            currentId = options.resourceId;
            currentArray.push(options.resourceId);
            var params = {
                url : "recommended/saveRecommend",
                data:options
            };
            if(options.token){
                tools.request(params,function(data){

                    if(options.total == ""){
                        options.total = 0;
                    }
                    if(data.code == 0){//第一次操作
                        $selector.find(".num").html((Number(options.total) +1));
                        $selector.append('<em class="click_tips" style="position: absolute">+1</em>');
                        $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                            $(this).remove();
                        });

                    }else if(data.code == 1){//操作失败
                        $selector.append('<em class="click_tips" style="position: absolute">'+data.message+'</em>');
                        $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                            $(this).remove();
                        });
                    }else{//已操作
                        $selector.append('<em class="click_tips">'+hasDo+'</em>');
                        $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                            $(this).remove();
                        });
                    }


                });
            }else {
                window.location.href = "login.html";
            }


        }else{
            $selector.append('<em class="click_tips">'+hasDo+'</em>');
            $selector.find('em').animate({top: '-28px', 'opacity': '0'}, 950, function () {
                $(this).remove();
            });
            return;
        }

    };
    /**
     * 统一跳出
     * @param option
     */
    global.tools.jumpLogin = function(){
        window.location.href = './login.html?redirect=' + encodeURIComponent(window.location.href);
    };
    global.tools.stringifyArray = function(array){
        return JSON.stringify(array);
    };
    /**
     * 收藏
     * @param option
     */
    global.tools.setCollect = function(options){
        var token = this.getCookie('token'),
            _selector = options.selector,
            _val = _selector.attr("data-value");
        var $num = options.num;
        if (token) {
            if (_val == 0) {
                _selector.css("position", "relative");
                this.request({
                    url: 'enshrine/saveEnshrine',
                    data: {
                        reId: options.id,
                        sourceType: options.type,
                        content: this.stringifyArray(options.content),
                        target: this.stringifyArray(options.title),
                        token:token
                    }
                },function (result) {
                    if (result.code == 0) {
                        if ($num) {
                            $num.text(parseInt($num.text()) + 1);
                        }
                        _selector.append('<em class="click_tips" style="position: absolute">+1</em>');
                        if(options.yl){
                            _selector.css("color","#ff993e");
                        }
                        if(options.active){
                            _selector.addClass("active");
                        }
                        _selector.find('em').animate({
                            top: '-28px',
                            'opacity': '0'
                        }, 950, function() {
                            $(this).remove();
                        });
                        _selector.attr("data-value", "1");
                        _selector.find("p").html('收藏('+(parseInt($num.text()))+')')
                    } else {
                        _selector.append('<em class="click_tips" style="position: absolute">已收藏</em>');

                        _selector.find('em').animate({
                            top: '-28px',
                            'opacity': '0'
                        }, 950, function() {
                            $(this).remove();
                        });
                    }
                })
            } else {
                _selector.append('<em class="click_tips" style="position: absolute">已收藏</em>');
                _selector.find('em').animate({
                    top: '-28px',
                    'opacity': '0'
                }, 950, function() {
                    $(this).remove();
                });
            }
        } else {
            window.location = 'login.html';
        }

    }
    /**
     * 输入框数字输入控制
     * @param params
     * {
     * el: object   css选择器
     * max: number  最大值
     * min: number  最小值
     * default: number 默认值
     * change: function 数值改变的回调 返回改变后的值
     * }
     * @returns {{init: init, event: event, update: update}}
     */
    global.tools.inputCount = function(param) {
        function checkNumber(str) {
            var reg = /^\d+$/;
            if (reg.test(str)) {
                return true;
            }
            return false;
        }
        function objFn (params) {
            this.obj = {
                init: function () {
                    this.oldval = '';
                    this.config = {
                        min: 0,
                        max: 999999
                    };
                    if (params && $.isPlainObject(params)) {
                        $.extend(this.config, params);
                    }
                    this.ipt = $(this.config.el).find('input');
                    var btns = $(this.config.el).find('i');
                    this.btn1 = btns.eq(0);
                    this.btn2 = btns.eq(1);
                    this.event();
                    return this;
                },
                event: function () {
                    var _this = this;
                    $(this.config.el).prop('tabIndex',-1).css('outline',"none");
                    this.oldval = this.config.default ? this.config.default : this.config.min;
                    this.ipt.val(this.oldval);
                    if(this.oldval > this.config.min){
                        this.btn1.removeClass('dio-disable');
                    } else {
                        this.btn1.addClass('dio-disable');
                    }
                    if(this.config.min === this.config.max){
                        this.btn1.addClass('dio-disable');
                        this.btn2.addClass('dio-disable');
                    } else{
                        this.btn2.removeClass('dio-disable');
                    }
                    this.btn1[0].onclick = function(){
                        var $el = $(this);
                        if($el.is('.dio-disable')){
                            return false;
                        }
                        var val = _this.ipt.val();
                        val--;
                        _this.oldval = val;
                        _this.ipt.val(val);
                        _this.changeBtnState();
                    };
                    this.btn2[0].onclick = function(){
                        var $el = $(this);
                        if($el.is('.dio-disable')){
                            _this.ipt.removeClass('inp-opreate-hover');
                            return false;
                        }
                        var val = _this.ipt.val();
                        val++;
                        _this.oldval = val;
                        _this.ipt.val(val);
                        _this.changeBtnState();
                    };
                    this.ipt[0].onkeyup = iptInput ;
                    function iptInput(){
                        var val = $(this).val();
                        if(!checkNumber(val)){
                            $(this).val(_this.oldval);
                            return false;
                        }
                        if(val-0 < _this.config.min ) {
                            $.daqMessage({
                                text: '最小购买数量为' + _this.config.min,
                                skin: 1,
                                position: 'center',
                                time: 1000
                            });
                            $(this).val(_this.oldval);
                        } else if( val-0 > _this.config.max) {
                            $.daqMessage({
                                text: '最大购买数量为' + _this.config.max ,
                                skin: 1,
                                position: 'center',
                                time: 1000
                            });
                            $(this).val(_this.oldval);
                        } else {
                            _this.oldval = val;
                            _this.changeBtnState();
                        }
                    }
                    $(this.config.el)[0].onblur = function (){
                        iptBlur();
                    };
                    _this.ipt[0].onfocus = iptFocus;
                    _this.ipt[0].onblur = iptBlur;
                    function iptFocus(){
                        _this.changeBtnState();
                    }
                    function iptBlur() {
                        _this.ipt.removeClass('inp-opreate-hover');
                        _this.btn1.removeClass('inp-opreate-curr');
                        _this.btn2.removeClass('inp-opreate-curr');
                    }
                },
                changeBtnState: function(){
                    var val = this.ipt.val()-0;
                    if( this.config.max === this.config.min) {
                        this.ipt.removeClass('inp-opreate-hover');
                        this.btn1.addClass('dio-disable').removeClass('inp-opreate-curr');
                        this.btn2.addClass('dio-disable').removeClass('inp-opreate-curr');
                    } else {
                        if(val < this.config.max && val > this.config.min) {
                            this.ipt.addClass('inp-opreate-hover');
                            this.btn2.removeClass('dio-disable').addClass('inp-opreate-curr');
                            this.btn1.removeClass('dio-disable').addClass('inp-opreate-curr');
                        } else if(val >= this.config.max ) {
                            this.ipt.removeClass('inp-opreate-hover');
                            this.btn2.addClass('dio-disable').removeClass('inp-opreate-curr');
                            this.btn1.removeClass('dio-disable').removeClass('inp-opreate-curr');
                        } else if(val <= this.config.min) {
                            this.ipt.removeClass('inp-opreate-hover');
                            this.btn1.addClass('dio-disable').removeClass('inp-opreate-curr');
                            this.btn2.removeClass('dio-disable').removeClass('inp-opreate-curr');
                        }
                    }
                    this.config.change && this.config.change(val);
                },
                /**
                 * @param param
                 * {
             *  max  number  最大值
             *  min  number  最小值
             *  val number   input框显示的值
             * }
                 */
                update:function  (param) {
                    this.config.max = param.max;
                    this.config.min = param.min;
                    if(this.oldval <= param.min) {
                        this.oldval = param.min;
                        this.ipt.val(param.min);
                    } else if(this.oldval >= param.max) {
                        this.oldval = param.max;
                        this.ipt.val(param.max);
                    } else if(this.oldval > param.min && this.oldval < param.max){
                        if(param.val >= 0) {
                            this.oldVal = param.val;
                            this.ipt.val(param.val);
                        }
                    }
                    this.changeBtnState();
                }
            };
            this.obj.init();
            return this.obj;
        }
        //return obj.init();
        return new objFn(param);
    };
    /**
     * 是否登录
     * @param callback 如果登录了执行的回调
     */
    global.tools.isLogin = function(callback) {
        if (!global.tools.getCookie('token')) {
            global.tools.doLogin();
            return false;
        }
        callback && callback();
    };
    // 统一登录处理
    global.tools.doLogin = function() {
        window.location.replace('./login.html?redirect=' + encodeURIComponent(window.location.href));
    };
    global.tools.goHome = function() {
        window.location.href = './index.html';
    };
    /**
     * 四则运算  计算小数的加减乘除出现误差的
     * @param num1
     * @param num2
     * @returns {{}}
     */
    global.tools.math = function (arg1, arg2) {
        return {
            // 两数字之和
            add: (function(arg1, arg2){
               var r1, r2, m, c;
               try {
                   r1 = arg1.toString().split(".")[1].length;
               }
               catch (e) {
                   r1 = 0;
               }
               try {
                   r2 = arg2.toString().split(".")[1].length;
               }
               catch (e) {
                   r2 = 0;
               }
               c = Math.abs(r1 - r2);
               m = Math.pow(10, Math.max(r1, r2));
               if (c > 0) {
                   var cm = Math.pow(10, c);
                   if (r1 > r2) {
                       arg1 = Number(arg1.toString().replace(".", ""));
                       arg2 = Number(arg2.toString().replace(".", "")) * cm;
                   } else {
                       arg1 = Number(arg1.toString().replace(".", "")) * cm;
                       arg2 = Number(arg2.toString().replace(".", ""));
                   }
               } else {
                   arg1 = Number(arg1.toString().replace(".", ""));
                   arg2 = Number(arg2.toString().replace(".", ""));
               }
               return (arg1 + arg2) / m;
           })(arg1, arg2),
            // 两数只差
            sub: (function(arg1, arg2){
                var r1, r2, m, n;
                try {
                    r1 = arg1.toString().split(".")[1].length;
                }
                catch (e) {
                    r1 = 0;
                }
                try {
                    r2 = arg2.toString().split(".")[1].length;
                }
                catch (e) {
                    r2 = 0;
                }
                m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
                n = (r1 >= r2) ? r1 : r2;
                return Number(((arg1 * m - arg2 * m) / m).toFixed(n));
            })(arg1, arg2),
            // 两数相乘
            mul: (function(arg1, arg2){
                var m = 0, s1 = arg1.toString(), s2 = arg2.toString();
                try {
                    m += s1.split(".")[1].length;
                }
                catch (e) {
                }
                try {
                    m += s2.split(".")[1].length;
                }
                catch (e) {
                }
                return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
            })(arg1, arg2),
            // 两数相除
            div: (function(arg1, arg2){
                var t1 = 0, t2 = 0, r1, r2;
                try {
                    t1 = arg1.toString().split(".")[1].length;
                } catch (e) {}
                try {
                    t2 = arg2.toString().split(".")[1].length;
                } catch (e) {
                } with (Math) {
                    r1 = Number(arg1.toString().replace(".", ""));
                    r2 = Number(arg2.toString().replace(".", ""));
                    return (r1 / r2) * pow(10, t2 - t1);
                }
            })(arg1, arg2)
        }
    };

    /**
     * [regMatch 验证字符串格式]
     * @param  {string} str  字符串
     * @param  {string} name 格式
     * @return {boolean}      是否符合对应的格式 符合返回true  不符合返回false
     */
    global.tools.regMatch = function (str, name) {
        var regexp = null;
        switch (name) {
            case 'name':
                regexp = /.{2,16}/;
                break;
            case 'pinyin':
                regexp = /^[a-zA-Z]{4,50}$/;
                break;
            case 'phone':
                regexp = /^1\d{10}$/;
                break;
            case 'needPassengerInfoOther1':
                regexp = /.+/;
                break;
            case 'needPassengerInfoOther2':
                regexp = /.+/;
                break;
            case 'idcard':
                regexp = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                break;
            case 'HKAndMacauPermit':
                regexp = /.+/;
                break;
            case 'Passport':
                regexp = /(P\d{7})|(G\d{8})/;
                break;
            case 'TaiwanPermit':
                regexp = /^[a-zA-Z0-9]{5,21}$/;
                break;
            case 'Idcard':
                regexp = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                break;
        }
        return regexp.test(str);
    };
    // tools.getConfig();
    /**
     * 设置2级页面banner
     */
    global.tools.setTowLevelBanner = function () {
        var $elment = $('.js_towlevelbanner')
        var channelCode = tools.getUrlParams('channelCode')
        var params = {
            url: 'siteChannel/channelList',
            data:{
                channelCode: channelCode
            }
        };
        tools.request(params, function(res){
            var _html = []
            var data = {},
                len = 0
                if(res.datas) {
                    data = res.datas;
                    len = res.datas.length;
                }

            if(res.code === 0) {
                if(res.datas.length>0){
                    // banner
                    if(res.datas[0].navImage !== ''){
                        $elment.html('<img src="'+res.datas[0].navImage+'" alt="">')
                    }else{
                        $elment.html('<img src="image/nobanner.jpg" alt="">')
                    }
                    // 面包削
                    //当前位置
                    _html.push('<i class="daq-icon ic-home">&#xe729;</i>您当前的位置：');
                    // console.log(data)
                    if (data[0].name !== 'wzsy') {
                        _html.push('<a href="./index.html">网站首页</a>');
                        _html.push('<i class="crumb-sign ' + ('-'== '&#xe618;' ? 'sysfont' : '') + '">' + '-' + '</i>');
                    };
                    for (var i = 0; i < len; i++) {
                        if (i === len - 1) {
                            if(data[i].code != 'wzlm') {
                                _html.push('<a href="' + (data[i].url.length ? decodeURIComponent(data[i].url) : "javascript:;") + '" class="on">' + ' ' + data[i].name + '</a>');
                            }
                        } else {
                            if(data[i].code != 'wzlm') {
                            _html.push('<a href="' + (data[i].url.length ? decodeURIComponent(data[i].url) : "javascript:;") + '">' + ' ' + data[i].name + '</a>');
                            _html.push('<i class="crumb-sign">' + '-' + '</i>');
                            }
                        };
                    };
                    $('.js_curmbs').html(_html)
                }else{
                    $elment.html('<img src="image/nobanner.jpg" alt="">')
                }
            } else{
                $elment.html('<img src="image/nobanner.jpg" alt="">')
            }
        })
    }
    global.tools.validate = function (value, type, minlength, maxlength) {
        var value = $.trim(value);
        // 非空验证
        if ('require' === type) {
            return !!value;
        }
        // 手机号验证
        if ('phone' === type) {
            return /^1\d{10}$/.test(value);
        }
        // 邮箱格式验证
        if ('email' === type) {
            return /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(value);
        }
        //验证长度
        if ('length' === type) {
            if (value.length <= minlength || value.length >= maxlength) {
                return false;
            } else {
                return true;
            }
        }
        //汉字和字母验证规则
        if ('chinese' === type) {
            return /^([\u4E00-\uFA29]*[a-z]*[A-Z]*[0-9]*)+$/.test(value);
        }
    };
    /**
     * 高亮替换
     * @param str  字符串
     * @param key  关键字
     */
    global.tools.highLight = function(str, key){
        var reg = new RegExp("("+ key +")","ig");
        str = str.replace(reg,"<b class='high-light'>$1</b>");
        return str;
    };
})(window, jQuery);

(function (global, $, undefined) {
    global.tools = global.tools || {};

    /**
     * 视频弹出层
     * @param option
     * {
     *  list: 视频列表选择器，默认为‘.video-lst’
     *  entry: 列表条目选择器，默认为‘li’
     *  title: 视频名称选择器，默认为‘.video-h3’
     *  video: 视频地址属性名(条目中的属性)，默认为‘data-src’
     *  img: 图片选择器，默认为‘img.scale-pic’
     *  play: 播放，默认为'.play-video'
     * }
     * @param played 点击播放后的回调事件
     */
    global.tools.popupVideo = function (option, played) {
        var list = option.list || '.video-lst';
        var entryElement = option.entry || 'li';
        var titleElement = option.title || '.video-h3';
        var imageElement = option.img || 'img.scale-pic';
        var videoAttr = option.video || 'data-src';
        var playClass = option.play || '.playVideo';

        function closeDIV() {
            $(".popup-video").remove();
        }

        $('body').on('click', '.popup-video .pop-remove', function () {
            closeDIV();
        });

        $(list).on("click", playClass, function (e) {
            var $entry = $(this).parents(entryElement).eq(0);
            var vedio_src = $entry.attr(videoAttr);
            var imgSrc = $entry.find(imageElement).attr("src");
            var tit = $entry.find(titleElement).html();

            var layer = '<div class="popup-video"><div class="opa80 pop-remove"></div>' +
                '<a class="pop-close pop-remove"></a>' +
                '<div class="video-box">' +
                '<div class="video-cont">' +
                '<div id="vedio" style="opacity:0; filter:alpha(opacity=0); -webkit-opacity:0; -moz-opacity:0;"></div>' +
                '<div class="vpro"></div>' +
                '</div>' +
                '<div class="video-tit">' +
                '<span>' + tit + '</span>' +
                // '<p><a class="share-video bds-more bdsharebuttonbox bdshare-button-style0-16" title="" data-cmd="more" style="position: absolute;top: 0; z-index:99; margin:0;padding:0;right: 0;width:32px; height:32px; display:inline-block; " data-bd-bind="1452487568673"></a></p>' +
                '</div>' +
                '</div>' +
                '</div>';

            $(document.body).append(layer);

            var _wid = $(".video-cont").width();
            var _hei = $(".video-cont").height();
            var s1 = new SWFObject("./flvplayer.swf", "single", _wid, _hei, "7");
            s1.addParam("allowfullscreen", "true");
            s1.addParam("wmode", "opaque");
            s1.addVariable("autostart", "true");	//打开时自动播放
            s1.addVariable("backcolor", "0x000000");
            s1.addVariable("frontcolor", "0xCCCCCC");
            s1.addVariable("file", vedio_src);
            s1.addVariable("image", imgSrc);	//封面图片的调用
            s1.addVariable("width", _wid);
            s1.addVariable("height", _hei);
            s1.write("vedio");
            $(".opa80").animate({opacity: 1}, 200);
            setTimeout(function () {
                $(".pop-close").animate({opacity: 1}, 200)
            }, 100);
            setTimeout(function () {
                $(".video-box").animate({opacity: 1}, 200)
            }, 100);
            setTimeout(function () {
                $(".vpro").animate({left: 0}, 500).fadeOut();
            }, 200);
            setTimeout(function () {
                $("#vedio").animate({opacity: 1}, 500)
            }, 800);

            if(played && typeof played === 'function') {
                played($entry);
            }
        });
    };
})(window, jQuery);


//# sourceMappingURL=utils.js.map
