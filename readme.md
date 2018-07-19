##文章目录自动生成插件

自动生成文章目录结构，灵活配置

#### 使用方法

* 引入js

``` html
    <div id="k-catelog">
		<h1>服务</h1>
		<h2 style="height: 300px;">配件商城</h2>
		<h1 style="height: 500px;">我的</h1>
		<h2 style="height: 500px;">个人中心</h2>  
		<h3 style="height: 400px;">第1季</h3>
		<h3 style="height: 500px;">第2季</h3>
		<h2 style="height: 1000px;">一键直播</h2>
    </div>
    <div class="k-catelog-list" id="catelog-list"></div>
```

``` javascript
new Katelog({
	contentEl: 'k-catelog',
	catelogEl: 'catelog-list',
	linkClass: 'k-catelog-link',
	linkActiveClass: 'k-catelog-link-active',
	supplyTop: 20,	
	active: function (el) {
		console.log(el);
    }
});
```

支持IE8以上和主流的浏览器

## 选项

##### contentEl

文章容器，id选择器

#### catelogEl

目录容器，id选择器

#### linkClass

每个目录项的类

#### linkActiveClass

当前激活的目录项的类

#### selector（可选）

选择目录的标题元素，默认支持6级树形结构

默认值: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

```javascript
selector: ['h2', 'h3']
```

#### supplyTop（可选）

每个目录需要补充的高度，比如fixed头部布局会挡住实现，可以设置supplyTop来修正

