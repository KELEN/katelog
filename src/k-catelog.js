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
    };

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
     * 移除事件
     * @param obj
     * @param type
     * @param fn
     */
    function removeEvent(obj, type, fn) {
        if (obj) {
            if (obj.detachEvent) {
                obj.detachEvent('on' + type, obj[type + fn]);
                obj[type + fn] = null;
            } else {
                obj.removeEventListener(type, fn, false);
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
                    ul += `<li><div class="${ option.linkClass }" data-target="${ tree[i].id }">` + tree[i].name + '</div>';
                    ul += generateHtmlTree(tree, tree[i]);
                    ul += '</li>';
                }
            }
            ul += '</ul>'
        }
        return hasChild ? ul : '';
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

    let allCatelogs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

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
        catelogs.forEach(function (c) {
            if (c.dataset.target === id) {
                c.classList.add(option.linkActiveClass);
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
            } else {
                c.classList.remove(option.linkActiveClass);
            }
        })
    }

    /**
     * 滚动处理事件
     * @param e
     */
    function resolveScroll(e) {
        // 鼠标滚动则触发，点击滚动不触发
        if (!clickToScroll) {
            let scrollTop = getScrollTop() + $catelog.offsetTop + option.supplyTop;
            let scrollToEl = null;
            for (let i = allCatelogs.length - 1; i >= 0; i--) {
                if (allCatelogs[i].offsetTop <= scrollTop) {
                    scrollToEl = allCatelogs[i];
                    break;
                }
            }
            if (scrollToEl) setActiveItem(scrollToEl.id);
        }
        clickToScroll = false;
    }

    addEvent(window, 'scroll', resolveScroll);

});