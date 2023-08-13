function getElementByXpath(path, doc) {  
return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue 
}

function addCss() {
var styles = `
.result-container {
  position: relative;
}
.nested {
  position: absolute;
  top: 10px;
  right: 10px;
}
`
var styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
}

class Cell {
constructor(el) {
this.el = el
this.dom = new DOMParser().parseFromString(el.outerHTML, 'text/html')
this.echartsEl = getElementByXpath("//script[contains(text(),'function(echarts)')]/..", this.dom)
this.markdownEl = getElementByXpath("//div[contains(@class, 'jp-MarkdownOutput')]", this.dom)
this.plotlyEl = getElementByXpath("//div[contains(@class, 'plotly-graph-div')]/../../../..", this.dom)
// this.renderedHTML = getElementByXpath("//div[contains(@class, 'jp-RenderedHTML')]", this.dom)
}

get type() {
var result = ''
switch (true) {
case this.echartsEl !== null:
result = 'echarts'
break
case this.markdownEl !== null:
result = 'markdown'
break
case this.plotlyEl !== null:
result = 'plotly'
break
case this.renderedHTML !== null:
result = 'renderedHTML'
break
default:
result = 'default'
break
}
return result
}

hasOutput() {
  return !(getElementByXpath("//*[contains(@class, 'jp-mod-noOutputs')]", this.dom))
}


pipeline(result, i) {
  if (!this.hasOutput()) {
    this.el.remove()
    return
  }
  if (this.type !== 'markdown') {

    this.el.querySelectorAll('.jp-Cell-inputWrapper').forEach(el => {
      el.remove()
    })
    this.el.querySelectorAll('.jp-OutputPrompt').forEach(el => {
      el.remove()
    })
  }
  this.el.classList.add('grid-stack-item-content')
  const wrapper = document.createElement('div')
  wrapper.classList.add('grid-stack-item')
  var div = document.createElement('div');
  div.classList.add('grid-stack-item-content')
  div.classList.add('result-container')
  wrapper.setAttribute("gs-id", i)
  wrapper.setAttribute("gs-w", 6)
  wrapper.setAttribute("gs-h", 3)
  if(this.type === 'echarts') {
    const mainDiv = this.el.querySelector('div[id]')
    const divId = mainDiv.getAttribute('id')
    mainDiv.setAttribute("style", "width:100%; height:100%;")
    mainDiv.classList.add('my-echarts')
    div.innerHTML = mainDiv.parentElement.innerHTML
  //div.appendChild(mainDiv.parentElement.cloneNode(true))
  //div.appendChild(this.el.cloneNode(true))
  } else {
    div.appendChild(this.el.cloneNode(true))
  }
  
  var close = document.createElement('div')
  close.classList.add('nested')
  close.innerHTML = '<button onclick="removeWidget(this.parentElement.parentElement.parentElement)">Lemove Me</button>'
  div.appendChild(close)
  wrapper.appendChild(div.cloneNode(true))
  result.appendChild(wrapper.cloneNode(true))
  
  //this.el.parentNode.replaceChild(wrapper, this.el)
  //main.appendChild(wrapper.cloneNode(true))
  
  const wrapper2 = document.createElement('div')
  wrapper2.classList.add('grid-stack-item')
  //wrapper2.setAttribute("gs-w", 6)
  //wrapper2.setAttribute("gs-h", 3)
  var div = document.createElement('div');
  div.classList.add('grid-stack-item-content')
  div.innerHTML = '<p>hello</p>'.trim()
  wrapper2.appendChild(div.cloneNode(true))
  
  //main.appendChild(wrapper2.cloneNode(true))
  // main.appendChild(this.el.cloneNode(true))
  }
}

function start() {
addCss()


// var main = document.getElementById('my-main')
var result = document.createElement('div');
result.classList.add('grid-stack')
result.setAttribute('v-scope', '')

//getElementByXpath('//*[@class="jp-Notebook"]', document).classList.add('grid-stack')
//document.querySelectorAll('.jp-Notebook')[0].style.height = "20000px"

const cells = []
//const documentCopy = document.cloneNode(true)
//const cellsDom = documentCopy.querySelectorAll('.jp-Cell')
const cellsDom = document.querySelectorAll('.jp-Cell')
for(var i = 0; i < cellsDom.length; i++) {
  cell = new Cell(cellsDom[i])
  cell.pipeline(result, i)
}
const jpCells = document.querySelectorAll('body > div.jp-Cell');

jpCells.forEach(function (element) {
    element.remove();
  });
   document.body.appendChild(result)

   var grid = GridStack.init({minRow: 1, margin: 2, cellHeight: '70px'})
   // var grid = GridStack.init({margin: 2})
   //var grid = GridStack.init({cellHeight: '70px'})
  addGridEditStyle(grid)

  grid.on('removed', function(event, items) {
    items.forEach(function(item) {
      addToTrash(item)
    })
  })
  window.addEventListener("resize", function(event){
    addGridEditStyle(grid)
  }, true)

return grid
}

function addGridEditStyle(grid) {
   var currentHeight = grid.opts.cellHeight
   var currentWidth = grid.cellWidth()
  var styles = `
.grid-stack {
  background: #efefef;
  background-image: linear-gradient(#ffffff .4rem, transparent .4rem), linear-gradient(90deg, #ffffff .4rem, transparent .4rem);
  background-size: ${currentWidth}px ${currentHeight}px;
}
  `
  var styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
  return
}

function addResizeEcharts() {
  const echartsElements = document.getElementsByClassName('my-echarts')
  for (let i = 0; i < echartsElements.length; i++) {
    const echartsId = echartsElements[i].getAttribute('id')
    var script = document.createElement('script')
    var code = `
        require(['echarts'], function(echarts) {
            
          const container = document.getElementById('${echartsId}');
const chart = echarts.init(container);
            new ResizeObserver(() => {
                chart.resize()
            }).observe(container)
        })
  `
    script.appendChild(document.createTextNode(code))
    document.body.appendChild(script)
  }
}


function removeWidget(el) {
  grid.removeWidget(el)
}


function addToTrash(item) {
  var event = new CustomEvent('addToTrashEvent', { detail: item.el })
  window.parent.document.dispatchEvent(event)
}

function resume() {
  require(['echarts'], function(echarts) {
  console.log('resume')
  grid.load(savedData, true)
/*
  grid.float(true)
  const idsToKeep = savedData.map(object => object.id)
  const gsElements = document.querySelectorAll('[gs-id]')
  gsElements.forEach(el => {
    const gsId = el.getAttribute('gs-id');
    if (!idsToKeep.includes(gsId)) {
      console.log('remove remove')
      grid.removeWidget(el, triggetEvent = false)
    }
  })
*/
})
}


//PetiteVue.createApp().mount()
import { createApp } from 'https://unpkg.com/petite-vue?module'
grid = start()
addResizeEcharts()
if (typeof window['savedData'] !== 'undefined') {
  resume()
}
//setTimeout(resume, 1000)

function cleanEl(el) {
  var serbe = el.cloneNode(true)
  var toRemove = el.getElementsByClassName('nested')[0]
  toRemove.remove()
  //var itemContent = serbe.getElementsByClassName('grid-stack-item-content')[0]
  var itemContent = serbe.getElementsByClassName('result-container')[0]
  var close = document.createElement('div')
  close.classList.add('nested')
  close.innerHTML = '<button onclick="removeWidget(this.parentElement.parentElement.parentElement)">Semove Me</button>'
  //itemContent.appendChild(close)
  el.appendChild(close)
}

window.document.addEventListener('restoreEvent', handleRestoreEvent, false)
window.document.addEventListener('saveEvent', handleSaveEvent, false)

function handleRestoreEvent(event) {
  var el = event.detail
  cleanEl(el)
  grid.addWidget(el, {x:0, y: 0, w: 6, h:3})
}

function handleSaveEvent(event) {
  var savedData = grid.save()
  savedData.forEach(object => {
    delete object['content'];
  })
  var event = new CustomEvent('savedDataEvent', { detail: savedData })
  window.parent.document.dispatchEvent(event)
}
