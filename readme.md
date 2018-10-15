# 文章目录自动生成器

> 类似于segmentfault和掘金的文章目录，无第三方依赖的，自动生成文章目录结构，灵活配置

[demo地址](https://kelen.github.io/k-catelog/dist/index.html)

#### npm引入

```
npm i katelog -S
```

#### es6使用
```javascript
import katelog from 'katelog';
console.log(katelog);
```

#### html引入

``` html
<!-- 引入js文件 -->
<script src='./katelog.min.js'></script>
<!-- 文章容器 -->
<div id="kCatelog"></div>
<!-- 目录容器 -->
<div class="k-catelog-list" id="catelogList"></div>
```

``` javascript
new Katelog({
    contentEl: 'kCatelog',
    catelogEl: 'catelogList',
    linkClass: 'k-catelog-link',
    linkActiveClass: 'k-catelog-link-active',
    supplyTop: 20,
    selector: ['h2', 'h3'],
    active: function (el) {
        console.log(el);
    }
});
```

**仅支持IE8以上和主流的浏览器**

## 选项

##### contentEl

文章容器，id选择器

##### catelogEl

目录容器，id选择器

##### linkClass

每个目录项的类

##### linkActiveClass

当前激活的目录项的类

##### selector（可选）

选择目录的标题元素，默认支持6级树形结构

默认值: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

```javascript
selector: ['h2', 'h3']
```

##### supplyTop（可选）

每个目录需要补充的高度，比如fixed头部布局会挡住实现，可以设置supplyTop来修正

## 方法

##### rebuild()

动态新增或者删除的内容，重新构建目录

```javascript
let Katelog = new Katelog({ ... });
Katelog.rebuild();
```
