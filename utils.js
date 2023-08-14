export const addToBody = `
<script>
  let editGrid = false
</script>

<template>
<div class="nested">
    <button onclick="removeWidget(this.parentElement.parentElement.parentElement)">Lemove Me</button>
</div>
<div class="mask"></div>
</template>

<div class="app-bar">
  <button onclick = "goToEdit()">Toggle Nested Elements</button>
  <button id="toggleButton2">Toggle Nested Elements</button>
</div>

<iframe id="iframe-loader" width="0" height="0" src="https://jupyter-gridstack.pages.dev/load">
</iframe>

<script>
  function handleLocalStorageReadyEvent () {
    console.log('local storage ready local')
  }
  window.document.addEventListener('localStorageReadyEvent', handleLocalStorageReadyEvent, false)

  function goToEdit() {
    const iframe = document.getElementById('iframe-loader')
    iframe.contentWindow.postMessage(
          {
              call:'sendData',
              transformedNotedbook: 'hello serbe',
          }, "*")
  }


  function addMaskCss() {
  var styles = \`
  .mask {
    position:absolute;
    left:0;
    top:0;
    background: rgba(255,255,255,.1);
    width:100%;
    height:100%;
    cursor: move;
  }
  \`
  var styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
  }

  function removeMaskCss() {
  var styles = \`
  .mask {
    display: none;
  }
  \`
  var styleSheet = document.createElement("style")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
  }

  function handleEditGridEvent() {
    editGrid = !editGrid
    const nestedElements = document.querySelectorAll('.nested')
    nestedElements.forEach(element => {
      element.style.display = editGrid ? 'block' : 'none';
    })
    if (editGrid) {
      addMaskCss()
    } else {
      removeMaskCss()
    }
  }
  window.document.addEventListener('editGridEvent', handleEditGridEvent, false)
  
  function removeAppBar() {
    const appBar = document.querySelectorAll('.app-bar')[0]
    appBar.style.display = 'none';
  }

</script>
`
export const mainScript = `
function getElementByXpath(path, doc) {  
return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue 
}

function addCss() {
var styles = \`
.result-container {
  position: relative;
}
.nested {
  position: absolute;
  top: 10px;
  right: 10px;
  display: none;
}
.app-bar {
  display: flex;
  background-color: DodgerBlue;
}
.app-bar > button {
  background-color: #f1f1f1;
  margin: 10px;
  padding: 20px;
  font-size: 30px;
}
.grid-stack-item-content {
  background-color: #f1f1f1;
  border-radius: 10px;
  border-style: solid;
  box-shadow: 0px 1px 3px rgb(0 0 0 / 13%);
}
\`
var styleSheet = document.createElement("style")
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
}

var grid

window.removeWidget = function(el) {
  grid.removeWidget(el)
}

class Cell {
  constructor(el) {
    this.el = el
    this.dom = new DOMParser().parseFromString(el.outerHTML, 'text/html')
    this.echartsEl = getElementByXpath("//script[contains(text(),'function(echarts)')]/..", this.dom)
    this.markdownEl = getElementByXpath("//div[contains(@class, 'jp-MarkdownOutput')]", this.dom)
    this.plotlyEl = getElementByXpath("//div[contains(@class, 'plotly-graph-div')]/../../../..", this.dom)
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
    //this.el.classList.add('grid-stack-item-content')
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
    } else {
      if(this.type === 'markdown') {
        div.innerHTML = this.el.querySelectorAll('.jp-MarkdownOutput')[0].innerHTML
      } else {
        div.appendChild(this.el.cloneNode(true))
      }
    }
    
    var t = document.getElementsByTagName("template")[0];
    var clone = t.content.cloneNode(true);
    div.appendChild(clone)
    wrapper.appendChild(div.cloneNode(true))
    result.appendChild(wrapper.cloneNode(true))
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
      var cell = new Cell(cellsDom[i])
      cell.pipeline(result, i)
    }
    const jpCells = document.querySelectorAll('body > div.jp-Cell');
    
    jpCells.forEach(function (element) {
        element.remove();
      });
       document.body.appendChild(result)
    
       grid = GridStack.init({
         minRow: 1,
         cellHeight: '100px'
      })
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
  if (!edit) {
    return
  }
   var currentHeight = grid.opts.cellHeight
   var currentWidth = grid.cellWidth()
  var styles = \`
.grid-stack {
  background: #efefef;
  background-image: linear-gradient(#ffffff .4rem, transparent .4rem), linear-gradient(90deg, #ffffff .4rem, transparent .4rem);
  background-size: \${currentWidth}px \${currentHeight}px;
}
  \`
  var styles = \`
.grid-stack {
background-image: linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 0px), linear-gradient(rgba(255,255,255,.3) 5px, transparent 100px), linear-gradient(90deg, rgba(255,255,255,.3) 5px, transparent 100px);
background-size: 100px 100px, calc(8.33% + 0px) 100px, 20px 20px, 20px 20px;
background-position: -2px -2px, -1px -2px, -1px -1px, -1px -1px;}
}
  \`
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
    var code = \`
        require(['echarts'], function(echarts) {
            
          const container = document.getElementById('\${echartsId}');
const chart = echarts.init(container);
            new ResizeObserver(() => {
                chart.resize()
            }).observe(container)
        })
  \`
    script.appendChild(document.createTextNode(code))
    document.body.appendChild(script)
  }
}




function addToTrash(item) {
  var event = new CustomEvent('addToTrashEvent', { detail: item.el })
  window.parent.document.dispatchEvent(event)
}

function resume() {
  require(['echarts'], function(echarts) {
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
//import { createApp } from 'https://unpkg.com/petite-vue?module'
//createApp().mount()

grid = start()
addResizeEcharts()

if (typeof window['savedData'] !== 'undefined') {
  console.log('resume resume')
  resume()
}

if (edit) {
  removeAppBar()
  handleEditGridEvent()
} else {
  grid.disable()
}


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
`
