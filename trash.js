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
  
  wrapper.appendChild(div.cloneNode(true))
  result.appendChild(wrapper.cloneNode(true))
  
  //this.el.parentNode.replaceChild(wrapper, this.el)
  //main.appendChild(wrapper.cloneNode(true))
  
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

   var grid = GridStack.init({
     margin: 2,
     cellHeight: '70px',
     column: 1,
     disableDrag: true,
     disableResize: true
   })

  document.querySelectorAll('.grid-stack-item').forEach(function(el) {
    grid.removeWidget(el)
  })

return grid
}



function myFunction(el) {
  //console.log(el)
  grid.removeWidget(el)
  //console.log(grid)
}

function save() {
  console.log('save iframe')
  var data = { foo: 'bar' }
  var event = new CustomEvent('saveEvent', { detail: data })
  window.parent.document.dispatchEvent(event)
}


//PetiteVue.createApp().mount()
grid = start()

function restore(item) {
  var event = new CustomEvent('restoreEvent', { detail: item.el })
  window.parent.document.dispatchEvent(event)
}

grid.on('removed', function(event, items) {
  items.forEach(function(item) {
    restore(item)
  })
})

function removeWidget(el) {
  grid.removeWidget(el)
}

function cleanEl(el) {
  const attributes = el.attributes
  Array.from(attributes).forEach((attribute) => {
    const attributeName = attribute.name;
    if(attributeName.startsWith("gs-") && attributeName != "gs-id") {
      el.removeAttribute(attributeName)
    }
  })
  var toRemove = el.getElementsByClassName('top-right')[0]
  toRemove.remove()
  var itemContent = el.getElementsByClassName('grid-stack-item-content')[0]
  var close = document.createElement('div')
  close.classList.add('nested')
  close.innerHTML = '<button onclick="removeWidget(this.parentElement.parentElement.parentElement)">Remove Me</button>'
  itemContent.appendChild(close)
}

window.document.addEventListener('addToTrashEvent', handleAddToTrashEvent, false)
function handleAddToTrashEvent(event) {
  var el = event.detail
  cleanEl(el)
  grid.addWidget(el)
}

console.log('bektash')
