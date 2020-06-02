# 原生js实现简单的svg编辑器
> 简单的实现了rect、circle、ellipse、line四个简单的基础图形的创建和编辑，这篇文章对于JavaScript中Dom操作和svg基础学习有很大帮助。
> 
> 项目在线预览：[http://coolxiang.top/svgeditor](http://coolxiang.top/svgeditor)

## 页面样式和布局
HTML和CSS相对来说比较简单，这里我不多介绍了。只是说一下这个页面使用rem和flexible自适应布局。另外通过flex实现左边工具栏固定rem宽度，右侧自适应大小宽度。
工具栏使用input滑动条和color选择器控制图形。
## 开始介绍js
#### 首先声明一些数据，比如每个图形的属性默认值
有一些私有的属性和公有的，我们区分开
```js
// 创建svg时需要的常量
const XMLNS = 'http://www.w3.org/2000/svg';
// 私有属性
const privateAttrs = {
rect: {x:10,y:10,width:200,height:100,rx:0,ry:0},
circle: {cx:200,cy:200,r:50},
ellipse: {cx:200,cy:200,rx:80,ry:30},
line: {x1:100,y1:100,x2:200,y2:200}
}
// 公共属性
const publicAttrs = {
fill: '#ffffff',
stroke: '#ff0000'
}
```
#### 我们可以先统计以下我们需要实现哪些功能
* 点击创建工具栏事件，创建图形，并且生成形状和外观工具栏。
* 改变形状工具栏中的滑动条，修改右侧图形形状（私有属性）。
* 改变外观工具栏中的滑动条或选择器，修改图形颜色外观（公有属性）。
* 点击svg图形，选中图形生成对应的工具栏并且同步数据。
* 考虑到右侧画板为自适应大小，因此滑动条中设置坐标的最大值应跟随页面大小变化，这里再添加一个resize事件。

以上就是这个编辑器的主要功能，根据这些功能我们开始一步一步实现。
1. **获取DOM对象**
	```js
	// 右侧画板
	const editorMap = document.querySelector('.editor-map');
	// 创建工具
	const createTools = document.querySelector('.create');
	// 形状工具
	const figureTools = document.querySelector('.figure ul');
	// 外观工具
	const appearanceTools = document.querySelector('.appearance ul');
	// 动态创建svg
	const svg = createSVG();
	// 当前选择的图形
	let selected = null;
	```
2. **根据上一步需求，首先需要创建svg**
	>创建的同时我们也需要给svg添加点击事件，这里使用事件委托的形式，通过e.target获取触发事件的dom对象即点击图形，后边同理。
	```js
	function createSVG() {
	  const svg = document.createElementNS(XMLNS, 'svg');
	  svg.setAttribute('width', '100%');
	  svg.setAttribute('height', '100%');
	  editorMap.appendChild(svg);
	  // 绑定点击事件，获取点击的图形dom
	  svg.addEventListener('click', (e) => {
	    if (privateAttrs[e.target.tagName.toLowerCase()]) {
	      selectFigure(e.target);  // 选择图形事件
	    }
	  })
	  return svg;
	}
	```
3. **这时候我们有需要实现一个选择图形的方法**
	```js
	function selectFigure(figure) {
	  // 存储当前创建的图形对象
	  selected = figure;
	  // 选中图形是，同过将当前图形移到最后一个子节点，使当前图形在最上层
	  let parent = selected.parentNode;
	  parent.removeChild(figure);
	  parent.appendChild(figure);
	  // 初始化形状工具和外观工具
	  figureTools.innerHTML = '';
	  appearanceTools.innerHTML = '';
	  for (let attr in privateAttrs[selected.tagName.toLowerCase()]) {
	    let value = selected.getAttribute(attr)
	    initFigureTools(attr, value); // 初始化每一个图形工具
	  }
	  initAppearanceTools();  // 初始化外观工具
	}
	```
	分局以上需求，我们有需要完成两个方法，但是根据顺序，创建图形的函数还未实现，我们可以先实现创建函数
4. **创建工具点击事件**
	```js
	createTools.addEventListener('click', (e) => {
	  if (e.target.tagName.toLowerCase() === 'button') {
	    createFigure(e.target.name);	// 创建图形
	  }
	})
	```
5. **需要实现创建图形的函数`createFigure`**
	```js
	function createFigure(type) {
	  // 创建图形dom
	  const figure = document.createElementNS(XMLNS, type);
	  // 添加私有属性和公有属性
	  for (let attr in privateAttrs[type]) {
	    figure.setAttribute(attr, privateAttrs[type][attr]);
	  }
	  for (let attr in publicAttrs) {
	    figure.setAttribute(attr, publicAttrs[attr]);
	  }
	  figure.setAttribute('stroke-width', 3);
	  // 将图形添加到svg中
	  svg.appendChild(figure);
	  selectFigure(figure);
	}
	```
	这里我们又用到`selectFigure`方法，因为创建时默认选中。
	现在我们的编辑器就可以实现创建图形了。
6. **继续第4步实现创建工具栏方法**
	```js
	// 生成形状工具
	function initFigureTools(attr, value) {
	  // 为了后边根据页面大小动态改变滑动条最大值，我将数据在方法每次触时计算
	  let options = {
	    x: editorMap.clientWidth,
	    y: editorMap.clientHeight,
	    cx: editorMap.clientWidth,
	    cy: editorMap.clientHeight,
	    width: editorMap.clientWidth,
	    height: editorMap.clientHeight,
	    rx: editorMap.clientWidth,
	    ry: editorMap.clientHeight,
	    r: editorMap.clientHeight,
	    x1: editorMap.clientWidth,
	    x2: editorMap.clientWidth,
	    y1: editorMap.clientHeight,
	    y2: editorMap.clientHeight
	  }
  	// 创建dom
	  const li = document.createElement('li');
	  const span = document.createElement('span');
	  const input = document.createElement('input');
	  // 设置内容和属性
	  span.innerHTML = attr;
	  input.setAttribute('type', 'range');
	  input.setAttribute('min', 0);
	  input.setAttribute('max', options[attr]);
	  input.setAttribute('name', attr);
	  input.setAttribute('value', value);
	  // 添加到页面中
	  li.appendChild(span);
	  li.appendChild(input);
	  figureTools.appendChild(li);
	}
	// 生成外观工具 由于外观工具比较简单固定，直接使用html字符串渲染，但是要注意插入当前选择图形的数据
	function initAppearanceTools() {
	  const html = `<li class="color"><label><span>填充</span><input type="color" value="${selected.getAttribute('fill') || publicAttrs.fill}" name="fill"></label></li>
	  <li class="color"><label><span>描边</span><input name="stroke" value="${selected.getAttribute('stroke') || publicAttrs.stroke}" type="color"></label><input type="range" value="${selected.getAttribute('stroke-width') || 1}" min="0" max="50" name="stroke-width"></li>`
	  appearanceTools.innerHTML = html;
	}
	```
7. **图形和工具栏已经创建完成了，接下来就是通过工具栏改变图形属性了。我们同样使用事件委托，绑定事件。**
	```js
	// 形状工具添加input事件
	figureTools.addEventListener('input', (e) => {
	  if (e.target.tagName.toLowerCase() === 'input') {
	    updateFigure(e.target);
	  }
	})
	// 外观和变换添加input事件
	appearanceTools.addEventListener('input', (e) => {
	  if (e.target.tagName.toLowerCase() === 'input') {
	    updateFigure(e.target);
	  }
	})
	```
8. **需要实现更新图形属性的方法`updateFigure()`**
	```js
	function updateFigure(input) {
	  let attr = input.name;
	  selected.setAttribute(attr, input.value);
	}
	```
9. **到这里我们的编辑器已经基本完成了~！最后我们要实现的是根据页面窗口大小更新设置工具栏**
	```js
	window.addEventListener('resize', (e) => {
	  selectFigure(selected);
	})
	```