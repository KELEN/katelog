(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return factory;
        });
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.Katelog = factory;
    }
})(window, function(opts) {

    let defaultOpts = {
        linkClass: 'k-catelog-link',
        linkActiveClass: 'k-catelog-link-active',
        supplyTop: 0,
        selector: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        active: null    // 激活时候回调
    };


    if (typeof Object.assign != 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }

    /**
     * 判断是否有class
     * @param node  节点
     * @param className 样式名
     * @returns {*}
     */
    function hasClass(node, className) {
        if (node.className) {
            return node.className.match(
                new RegExp('(\\s|^)' + className + '(\\s|$)'));
        } else {
            return false;
        }
    };

    /**
     *  添加样式
     * @param node  节点
     * @param className 样式名
     */
    function addClass(node, className) {
        if (!hasClass(node, className)) node.className += " " + className;
    };


    /**
     *  移除样式
     * @param node  节点
     * @param className 将移除的样式
     */
    function removeClass(node, className) {
        if (hasClass(node, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
            node.className = node.className.replace(reg, ' ');
        }
    };

    function arrayLikeToArray (al) {
        return Array.prototype.slice.call(al);
    }

    const option = Object.assign({}, defaultOpts, opts);
    const $content = document.getElementById(option.contentEl);      // 内容元素
    const $catelog = document.getElementById(option.catelogEl);     // 目录元素

    /**
     * 获取目录树
     * @param catelogs
     */
    function getCatelogsTree(catelogs) {
        let title, tagName,
            tree = [], treeItem = {}, parentItem = {id: -1}, lastTreeItem = null;

        let id;

        for (let i = 0; i < catelogs.length; i++) {
            title = catelogs[i].innerText || catelogs[i].textContent;
            tagName = catelogs[i].tagName;
            id = 'heading-' + i;
            catelogs[i].id = id;
            treeItem = {
                name: title,
                tagName: tagName,
                id: id,
                level: getLevel(tagName),
                parent: parentItem
            };
            if (lastTreeItem) {
                if (getPriority(treeItem.tagName) < getPriority(lastTreeItem.tagName)) {
                    treeItem.parent = lastTreeItem;
                } else {
                    treeItem.parent = findParent(treeItem, lastTreeItem);
                }
            }
            lastTreeItem = treeItem;
            tree.push(treeItem);
        }
        return tree;
    }

    /**
     * 找到当前节点的父级
     * @param currTreeItem
     * @param lastTreeItem
     * @returns {*|Window}
     */
    function findParent(currTreeItem, lastTreeItem) {
        let lastTreeParent = lastTreeItem.parent;
        while (lastTreeParent && (getPriority(currTreeItem.tagName) >= getPriority(lastTreeParent.tagName))) {
            lastTreeParent = lastTreeParent.parent;
        }
        return lastTreeParent || {id: -1};
    }


    /**
     *  获取等级
     * @param tagName
     * @returns {*}
     */
    function getLevel (tagName) {
        return tagName ? tagName.slice(1): 0;
    }

    /**
     *  获取权重
     */
    function getPriority(tagName) {
        let priority = 0;
        if (tagName) {
            switch (tagName.toLowerCase()) {
                case 'h1':
                    priority = 6;
                    break;
                case 'h2':
                    priority = 5;
                    break;
                case 'h3':
                    priority = 4;
                    break;
                case 'h4':
                    priority = 3;
                    break;
                case 'h5':
                    priority = 2;
                    break;
                case 'h6':
                    priority = 1;
                    break;
            }
        }
        return priority;
    }

    /**
     * 绑定事件
     * @param obj
     * @param type
     * @param fn
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
     * 生成树
     * @param tree
     */
    function generateHtmlTree(tree, _parent) {
        let ul, hasChild = false;
        if (tree) {
            ul = '<ul>';
            for (let i = 0; i < tree.length; i++) {
                if (isEqual(tree[i].parent, _parent)) {
                    hasChild = true;
                    ul += `<li><div class="${ option.linkClass } k-catelog-level-${ tree[i].level }" data-target="${ tree[i].id }">` + tree[i].name + '</div>';
                    ul += generateHtmlTree(tree, tree[i]);
                    ul += '</li>';
                }
            }
            ul += '</ul>'
        }
        return hasChild ? ul : '';
    }

    /**
     * 获取dataset属性
     * @param el
     * @param id
     * @returns {*}
     */
    function getDataset (el, id) {
        if (el.dataset) {
            return el.dataset[id];
        } else {
            return el.getAttribute(`data-${ id }`)
        }
    }

    function isEqual(node, node2) {
        return node && node2 && typeof node === 'object' && typeof node2 === 'object' && node.id === node2.id
    }

    /**
     * 获取滚动条滚动的高度
     * @returns {number}
     */
    function getScrollTop() {
        return document.documentElement.scrollTop || document.body.scrollTop;
    }

    let allCatelogs = $content.querySelectorAll(option.selector.join());

    let tree = getCatelogsTree(allCatelogs);

    let clickToScroll = false;      // 点击跳转不触发scroll事件

    $catelog.innerHTML = generateHtmlTree(tree, {id: -1});

    let styleText = `
        .k-catelog-list { overflow: hidden !important; }
        .k-catelog-list > ul { position: relative; }    
    `;
    let styleNode = document.createElement('style');
    styleNode.type = 'text/css';
    if (styleNode.styleSheet) {
        styleNode.styleSheet.cssText = styleText;
    } else {
        styleNode.innerHTML = styleText;
    }
    document.getElementsByTagName('head')[0].appendChild(styleNode);

    addEvent($catelog, 'click', function (e) {
        let target = e.target || e.srcElement;
        let id = target.getAttribute('data-target');
        if (id) {
            let headEl = document.getElementById(id);
            clickToScroll = true;
            window.scrollTo(0, headEl.offsetTop - option.supplyTop);
            setActiveItem(id);
        }
    });

    /**
     *  设置选中的项
     */
    function setActiveItem(id) {
        let catelogs = $catelog.querySelectorAll('[data-target]');
        catelogs = arrayLikeToArray(catelogs);
        let activeTarget = null, c;

        for (let i = 0; i < catelogs.length; i++) {
            c = catelogs[i];
            if (getDataset(c, 'target') === id) {

                addClass(c, option.linkActiveClass)

                activeTarget = c;

                if ($catelog.children[0].offsetHeight > $catelog.offsetHeight) {
                    if (c.offsetTop > $catelog.offsetHeight / 2) {
                        // 距离底部小于容器的一般，不能margin上去了
                        if ($catelog.children[0].offsetHeight - c.offsetTop - c.offsetHeight < $catelog.offsetHeight / 2) {
                            $catelog.children[0].style.marginTop = -$catelog.children[0].offsetHeight + $catelog.offsetHeight + 'px';
                        } else {
                            $catelog.children[0].style.marginTop = ($catelog.offsetHeight / 2) - c.offsetTop + 'px';
                        }
                    } else {
                        $catelog.children[0].style.marginTop = '0px';
                    }
                }

            } else {
                removeClass(c, option.linkActiveClass)
            }
        }
        if (typeof option.active === 'function') {
            option.active.call(this, activeTarget);
        }
    }

    /**
     * 滚动处理事件
     * @param e
     */
    function resolveScroll(e) {
        // 鼠标滚动则触发，点击滚动不触发
        if (!clickToScroll) {
            let scrollTop = getScrollTop() + option.supplyTop;
            let scrollToEl = null;
            for (let i = allCatelogs.length - 1; i >= 0; i--) {
                if (allCatelogs[i].offsetTop <= scrollTop) {
                    scrollToEl = allCatelogs[i];
                    break;
                }
            }
            if (scrollToEl) setActiveItem(scrollToEl.id);
            else setActiveItem(null);   // 无匹配的元素
        }
        clickToScroll = false;
    }

    addEvent(window, 'scroll', resolveScroll);

});