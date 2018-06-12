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
})(this, function(opts) {
    'use strict';

    let defaultOpts = {
        linkClass: 'k-catelog-link',
        linkActiveClass: 'k-catelog-link-active',
        supplyTop: 20,
    };

    const option = Object.assign({}, defaultOpts, opts);
    const $content = document.getElementById(option.contentEl);      // 内容元素
    const $catelog = document.getElementById(option.catelogEl);     // 目录元素


    /**
     * 获取目录树
     * @param catelogs
     */
    function getCatelogsTree (catelogs) {
        let title, tagName,
            tree = [], treeItem = {}, parentItem = { id: -1 }, lastTreeItem = null;

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
        return lastTreeParent || { id: -1 };
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

    let allCatelogs = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    let tree = getCatelogsTree(allCatelogs);

    $catelog.innerHTML = generateHtmlTree(tree, { id: -1 });

    /**
     * 生成树
     * @param tree
     */
    function generateHtmlTree (tree, _parent) {
        let ul, hasChild = false;
        if (tree) {
            ul = '<ul>';
            for (let i = 0; i < tree.length; i++) {
                if (isEqual(tree[i].parent, _parent)) {
                    hasChild = true;
                    ul += '<li><div>' + tree[i].name + '</div>';
                    ul += generateHtmlTree(tree, tree[i]);
                    ul += '</li>';
                }
            }
            ul += '</ul>'
        }
        return hasChild ? ul: '';
    }

    function isEqual(node, node2) {
        return node && node2 && typeof node === 'object' && typeof node2 === 'object' && node.id === node2.id
    }

});