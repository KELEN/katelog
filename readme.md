##文章目录自动生成插件


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

* 配置

``` javascript
new KCate({
    el: 'k-catelog',        // 文章标题的容器
	target: 'catelog-list',  // 目录容器
	level: {			
		one: 'h1',			// 一级目录对应的标签
		two: 'h2',			// 二级目录对应的标签
		three: 'h3'			// 三级目录对应的标签
	},	
	linkClass: 'k-catelog-link',		// 可选，对应的链接样式
	linkActiveClass: 'k-catelog-link-active'	// 可选，当前链接样式
}); 
```

