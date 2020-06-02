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
// 创建工具添加点击事件
createTools.addEventListener('click', (e) => {
  if (e.target.tagName.toLowerCase() === 'button') {
    createFigure(e.target.name);
  }
})
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
window.addEventListener('resize', (e) => {
  selectFigure(selected);
})
// 创建svg
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
// 创建图形
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
// 选中图形
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

// 生成形状tools
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
// 生成外观tools
function initAppearanceTools() {
  const html = `<li class="color"><label><span>填充</span><input type="color" value="${selected.getAttribute('fill') || publicAttrs.fill}" name="fill"></label></li>
  <li class="color"><label><span>描边</span><input name="stroke" value="${selected.getAttribute('stroke') || publicAttrs.stroke}" type="color"></label><input type="range" value="${selected.getAttribute('stroke-width') || 1}" min="0" max="50" name="stroke-width"></li>`
  appearanceTools.innerHTML = html;
}
// 修改figure的属性
function updateFigure(input) {
  let attr = input.name;
  selected.setAttribute(attr, input.value);
}
