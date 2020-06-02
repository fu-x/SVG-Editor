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
// 获取DOM元素
const editorMap = document.querySelector('.editor-map');
const createTools = document.querySelector('.create');
const figureTools = document.querySelector('.figure ul');
const appearanceTools = document.querySelector('.appearance ul');
const svg = createSVG();
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
  svg.addEventListener('click', (e) => {
    if (privateAttrs[e.target.tagName.toLowerCase()]) {
      selectFigure(e.target)
    }
  })
  return svg;
}
// 创建图形
function createFigure(type) {
  const figure = document.createElementNS(XMLNS, type);
  for (let attr in privateAttrs[type]) {
    figure.setAttribute(attr, privateAttrs[type][attr]);
  }
  for (let attr in publicAttrs) {
    figure.setAttribute(attr, publicAttrs[attr]);
  }
  figure.setAttribute('stroke-width', 3);
  svg.appendChild(figure);
  selectFigure(figure);
}
// 选中图形
function selectFigure(figure) {
  selected = figure;
  let parent = selected.parentNode;
  parent.removeChild(figure);
  parent.appendChild(figure);
  figureTools.innerHTML = '';
  appearanceTools.innerHTML = '';
  for (let attr in privateAttrs[selected.tagName.toLowerCase()]) {
    let value = selected.getAttribute(attr)
    initFigureTools(attr, value);
  }
  initAppearanceTools();
}
// 生成形状tools
function initFigureTools(attr, value) {
  let client = editorMap.clientWidth > editorMap.clientHeight ? editorMap.clientHeight : editorMap.clientWidth;
  const li = document.createElement('li');
  const span = document.createElement('span');
  const input = document.createElement('input');
  span.innerHTML = attr;
  input.setAttribute('type', 'range');
  input.setAttribute('min', 0);
  input.setAttribute('max', client);
  input.setAttribute('name', attr);
  input.setAttribute('value', value);
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
