;(function (KCate) {

    self.KCate = KCate;

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = KCate;
    } else if (typeof define == 'function' && define.amd) {
        define('KCate', [], function () {
            return KCate;
        })
    }

})(function (opts) {

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame'] ||
            window[vp + 'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        ||
        !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() {
                    callback(lastTime = nextTime);
                },
                nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }

    var defOpts = {
        el: '',
        level: {
            one: 'h2',
            two: 'h3',
            three: 'h4'
        },
        active: null,
        supplyTop: 0		// 补充滚动高度，例如fixed菜单会遮住
    };

    this.opts = extend(defOpts, opts);	// 配置
    this.treeId = randomId();
    this.treeArray = [];		// 属性数组
    this.hasScrollTop = document.documentElement.scrollTop || document.body.scrollTop;		// 已经滚动的位置


    var elem = document.getElementById(this.opts.el);	// 元素
    var targetElem = document.getElementById(this.opts.target);
    var _this = this;

    var sel = [];   // 选择
    if (_this.opts.level.one) {
        sel.push(_this.opts.level.one);
    }
    if (_this.opts.level.two) {
        sel.push(_this.opts.level.two);
    }
    if (_this.opts.level.three) {
        sel.push(_this.opts.level.three);
    }
    // 获取所有的目录
    var catelogs = elem.querySelectorAll(sel.join(","));

    addEvent(targetElem, 'click', function (e) {
        var target = e.taregt || e.srcElement,
            destId = target.getAttribute('data-target');		// 目标
        if (destId) {
            destEl = document.getElementById(destId);
            var top = destEl.getBoundingClientRect().top + getScrollTop() - _this.opts.supplyTop;
            window.scrollTo(0, top);
        }
    });

    var levelOneEles = document.getElementsByTagName(this.opts.level.one);	// 一级目录标签

    if (!levelOneEles.length) {
        this.opts.level.one = this.opts.level.two;
        this.opts.level.two = this.opts.level.three;
        this.opts.level.three = '';
        levelOneEles = document.getElementsByTagName(this.opts.level.one);  // 没有一级，就显示二级
    }

    for (var i = 0; i < levelOneEles.length; i++) {
        var levelOneEle = levelOneEles[i],
            id = "k-cate-" + i,
            tmp = {
                ele: levelOneEle,
                text: levelOneEle.innerText,
                next: []
            };

        levelOneEle.setAttribute("id", id);

        tmp.next = getSiblingsElemObj(levelOneEle, this.opts.level.one, this.opts.level.two, id);

        if (this.opts.level.three) {
            // 有设置三级目录
            for (var j = 0; j < tmp.next.length; j++) {
                tmp.next[j].next = getSiblingsElemObj(tmp.next[j].ele, this.opts.level.two, this.opts.level.three, tmp.next[j].ele.id);
            }
        }
        this.treeArray.push(tmp);
    }

    if (targetElem) {
        targetElem.appendChild(generateCatelog(this.treeArray, this.opts.linkClass));
    } else {
        throw new Error("target options is not set");
    }

    var scrollHandler = throttle(function () {
        var scrollTop = getScrollTop();
        // 滚动到指定的元素, 对应的按钮改变样式
        var catelogItem = getScrollTarget(catelogs, scrollTop - _this.opts.supplyTop);
        if (catelogItem) {
            addActiveElement(catelogItem.id);
        } else {
            // 移除所有激活的样式
            addActiveElement(-1);
        }
    }, 50);

    scrollHandler();
    addEvent(window, 'scroll', scrollHandler);


    function getScrollTop() {
        return document.documentElement.scrollTop || document.body.scrollTop;		// 已经滚动的位置
    }

    function addActiveElement(id) {
        var linkA = targetElem.getElementsByTagName('div'), i;
        for (i = 0; i < linkA.length; i++) {
            if (linkA[i].getAttribute("data-target") != id) {
                removeClass(linkA[i], _this.opts.linkActiveClass);
            }
        }
        var link = targetElem.querySelector("div[data-target='" + id + "']");		// 目标对应的链接
        if (link) {
            addClass(link, _this.opts.linkActiveClass);
        }
        if (typeof _this.opts.active === 'function') _this.opts.active.call(_this, link);
    }

    /**
     * 对象扩展
     * @param  {[type]}
     * @param  {[type]}
     * @return {[type]}
     */
    function extend(to, src) {
        for (var i in src) {
            if (typeof src[i] == 'object') {
                extend(to[i], src[i]);
            } else {
                to[i] = src[i];
            }
        }
        return to;
    }

    /**
     *  绑定事件
     */
    function addEvent(obj, type, fn) {
        if (obj) {
            if (obj.attachEvent) {
                obj['e' + type + fn] = fn;
                obj[type + fn] = function () {
                    obj['e' + type + fn](window.event);
                };
                obj.attachEvent('on' + type, obj[type + fn]);
            } else {
                obj.addEventListener(type, fn, false);
            }
        }
    };

    /**
     * 节流函数
     * @param method 事件触发的操作
     * @param mustRunDelay 间隔多少毫秒需要触发一次事件
     */
    function throttle(method, mustRunDelay) {
        let timer,
            args = arguments,
            start;
        return function loop() {
            let self = this;
            let now = Date.now();
            if (!start) {
                start = now;
            }
            if (timer) {
                clearTimeout(timer);
            }
            if (now - start >= mustRunDelay) {
                method.apply(self, args);
                start = now;
            } else {
                timer = setTimeout(function () {
                    loop.apply(self, args);
                }, 50);
            }
        }
    }

    function getScrollTarget(arr, scrollTop) {
        for (var i = arr.length - 1; i >= 0; i--) {
            if (arr[i].offsetTop <= scrollTop) {
                return arr[i];
            }
        }
        return null;
    }

    function addClass(elem, className) {
        if (!elem.className) {
            elem.className = className;
        } else if (!hasClass(elem, className)) {
            elem.className = elem.className + " " + className;
        }
    }

    function removeClass(elem, className) {
        if (hasClass(elem, className)) {
            elem.className = (elem.className.replace(className, "")).trim();
            if (!elem.className) {
                elem.removeAttribute('class');
            }
        }
    }

    function hasClass(elem, className) {
        return elem.className.indexOf(className) == -1 ? false : true;
    }

    /**
     * 生成目录
     * @return {[type]}
     */
    function generateCatelog(treeArray, linkClass) {
        var ul = document.createElement("ul");
        for (var i = 0; i < treeArray.length; i++) {
            var li = document.createElement('li');
            var div = document.createElement("div");
            if (linkClass) {
                div.className = linkClass;
            }
            var destId = treeArray[i].ele.id;
            div.setAttribute('data-target', destId);
            div.innerText = treeArray[i].text;
            li.appendChild(div);
            if (treeArray[i].next && treeArray[i].next.length > 0) {
                li.appendChild(generateCatelog(treeArray[i].next, linkClass));
            }
            ul.appendChild(li);
        }
        return ul;
    }


    /**
     * 获取同级元素例如 h2 到下一个 h2 之间的 h3
     * @parentEle  {string}
     * @tag  {string}
     * @return {obj}
     */
    function getSiblingsElemObj(srcElem, srcTag, desTag, parentId) {
        var tmp = [];
        srcTag = srcTag.toUpperCase();
        desTag = desTag.toUpperCase();
        var idx = 0;
        while (srcElem = srcElem.nextSibling) {
            if (srcElem.tagName === srcTag) {
                // 下一个元素跟上一个元素相同 h2-h2
                break;
            }
            if (srcElem.nodeType == 1) {
                if (srcElem.tagName !== srcTag) {
                    if (srcElem.tagName == desTag) {
                        srcElem.id = parentId + "-" + idx;
                        tmp.push({
                            ele: srcElem,
                            text: srcElem.innerText,
                            next: []
                        });
                        idx++;
                    }
                } else {
                    break;
                }
            }
        }
        return tmp;
    }

    function randomId() {
        return new Date().getTime() + '_' + 'cate';
    }
});