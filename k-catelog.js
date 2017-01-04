;(function(KCate) {

    self.KCate = KCate;

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = KCate;
    } else if (typeof define == 'function' && define.amd) {
        define('KCate', [], function() {
            return KCate;
        })
    }

})(function(opts) {

	var defOpts = {
		el: '',
		level: {
			one: 'h2',
			two: 'h3',
		}
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

	this.opts = extend(defOpts, opts);	// 配置

	var elem = document.getElementById(this.opts.el);	// 元素
	var targetElem = document.getElementById(this.opts.target);

	this.treeId = randomId();
	this.treeObj = [];
	var that = this;


	var levelOneEles = document.getElementsByTagName(this.opts.level.one);	// 一级目录标签

	for (var i = 0; i < levelOneEles.length; i++) {
		var levelOneEle = levelOneEles[i];
		var id = "k-cate-" + i;
		levelOneEle.setAttribute("id", id);
		var tmp = {
			ele: levelOneEle,
			text: levelOneEle.innerText,
			next: []
		}

		tmp.next = getSiblingsElemObj(levelOneEle, this.opts.level.one, this.opts.level.two, id);

		if (this.opts.level.three) {
			// 有设置三级目录
			for (var j = 0; j < tmp.next.length; j++) {
				tmp.next[j].next = getSiblingsElemObj(tmp.next[j].ele, this.opts.level.two, this.opts.level.three, tmp.next[j].ele.id);
			}
		}		

		this.treeObj.push(tmp);
	}

	if (targetElem) {
        targetElem.appendChild(generateCatelog(this.treeObj, this.opts.linkClass));
    } else {
        throw new Error("target options is not set");
    }

    window.onscroll = function() {
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		var catelog = elem.querySelectorAll(that.opts.level.one + "," + that.opts.level.two + ","  + that.opts.level.three);

		// 滚动到指定的元素, 对应的按钮改变样式
		var target = getScrollTarget(catelog, scrollTop);		
		var id = target.id;
		var linkA = targetElem.getElementsByTagName('a');

		for (var i = 0; i < linkA.length; i++) {
			if (linkA[i].getAttribute("href") != "#" + id) {
				removeClass(linkA[i], that.opts.linkActiveClass);
			}
		}
		var link = targetElem.querySelector("a[href='#" + id + "']");		// 目标对应的链接
		addClass(link, that.opts.linkActiveClass);
	}


	function getScrollTarget(arr, scrollTop) {
		for (var i = arr.length - 1; i >= 0; i--) {
			if (arr[i].offsetTop <= scrollTop) {
				return arr[i];
			} 
		}
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
		return elem.className.indexOf(className) == -1 ? false: true;
	}

	/**
	 * 生成目录
	 * @return {[type]}
	 */
	function generateCatelog(treeObj, linkClass) {
		var ul = document.createElement("ul");
		for (var i = 0; i < treeObj.length; i++) {
			var li = document.createElement('li');
			var a = document.createElement("a");
			if (linkClass) {
				a.className = linkClass;
			}
			a.href = "#" + treeObj[i].ele.id;
			a.innerText = treeObj[i].text;
			li.appendChild(a);
			if (treeObj[i].next && treeObj[i].next.length > 0) {
				li.appendChild(generateCatelog(treeObj[i].next, linkClass));
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
						idx ++;
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