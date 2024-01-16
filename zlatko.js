/*
let editGrid = false

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
*/
  //const savedData = [{id: 0, x:2, y:0, w: 6, h: 3}]
  const cells = []
  var originalSourceCode = ""
  const resizedDone = []
  const isTrash = typeof trashMark !== 'undefined'
  console.log("isTrash")
  console.log(isTrash)
  var editReady = false
  function sendNotebook () {
    const iframe = document.getElementById('iframeLoader')
    iframe.contentWindow.postMessage(
      {
        call:'sendData',
        transformedNotedbook: originalSourceCode,
      }, "*"
    )
  }
  window.addEventListener('message', function(event) {
    if(event.type === 'message' && event.data === 'editReady') {
      editReady = true
      console.log('edit ready')
      sendNotebook()
    }
    if(event.type === 'message' && event.data === 'uploadReady') {
      console.log('upload ready')
      window.location.href = "https://jupyter-gridstack.pages.dev/edit"
    }
  }, false)

  function goToEdit() {
    console.log("go to edit")
    console.log(editReady)
    if(editReady) {
      sendNotebook()
      return
    }
    const iframe = document.createElement('iframe')
    iframe.id = 'iframeLoader'
    iframe.src = 'https://jupyter-gridstack.pages.dev/load'
    //iframe.src = 'http://localhost:3000/load'
    iframe.width = '0'
    iframe.height = '0'
    iframe.frameBorder = '0'
    document.body.appendChild(iframe)
  }

  function handleEditEvent() {
    edit = !edit
    if (edit) {
      addEditStyle()
      grid.enable()
    } else {
      removeEditStyle()
      grid.disable()
    }
  }

  window.document.addEventListener('editGridEvent', handleEditEvent, false)
  
  function removeAppBar() {
    const appBar = document.querySelectorAll('.app-bar')[0]
    appBar.style.display = 'none';
  }

function getElementByXpath(path, doc) {  
  return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue 
}

function addCss() {
var styles = `
.result-container {
  position: relative;
}
.top-right {
  position: absolute;
  top: -5px;
  right: 5px;
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
`
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
    this.vegaEl = getElementByXpath("//div[contains(@id, 'altair-viz-')]/..", this.dom)
    this.bokehEl = getElementByXpath("//script[contains(text(), 'root.Bokeh.embed')]/../../..//div[@data-root-id]", this.dom)
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
      case this.vegaEl !== null:
        result = 'vega'
        break
      case this.bokehEl !== null:
        result = 'bokeh'
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



  pipeline() {
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
    var div = document.createElement('div');
    if(this.type === 'echarts') {
      const mainDiv = this.el.querySelector('div[id]')
      const divId = mainDiv.getAttribute('id')
      mainDiv.setAttribute("style", "width:100%; height:100%;")
      mainDiv.classList.add('my-echarts')
      mainDiv.setAttribute('resize-type', 'echarts')
      div.innerHTML = mainDiv.parentElement.innerHTML
    } else if (this.type === 'markdown') {
      div.innerHTML = this.el.querySelectorAll('.jp-MarkdownOutput')[0].innerHTML
    } else if (this.type === 'plotly') {
      const mainDiv = this.el.querySelector('div.plotly-graph-div') 
      mainDiv.setAttribute("style", "width:100%; height:100%;")
      mainDiv.classList.add('my-plotly')
      mainDiv.setAttribute('resize-type', 'plotly')
      div.innerHTML = mainDiv.parentElement.innerHTML
    } else if (this.type === 'vega') {
      this.vegaEl.querySelectorAll("div")[0].classList.add('my-vega')
      this.vegaEl.querySelectorAll("div")[0].setAttribute('resize-type', 'vega')
      var styleElement = this.vegaEl.querySelector("style")
      //styleElement.parentNode.removeChild(styleElement)
      this.vegaEl.classList.add('my-vega')
      div.append(this.vegaEl.querySelectorAll("div")[0])
      div.append(this.vegaEl.querySelectorAll("script")[0])
    } else if (this.type === 'bokeh') {
      console.log('boookeeehhh')
      //div.append(document.querySelectorAll('[data-root-id]')[0])
      //div.append(document.querySelector('script'))
      //div.innerHTML = this.bokehEl.innerHTML
      var bokehScript = getElementByXpath("//script[contains(text(), 'root.Bokeh.embed')]", this.dom).innerHTML
      var lines = bokehScript.split("\n")
      let dataJson
      for (let i = 0; i < lines.length; i++) {
        if(lines[i].includes('const docs_json =')) {
          dataJson = lines[i]
        }
      }
      if (dataJson) { 
        dataJson = dataJson.substring(dataJson.indexOf('{'), dataJson.lastIndexOf(';'))
        let dataBokeh = JSON.parse(dataJson)
	let dataBokehRoots = dataBokeh[Object.keys(dataBokeh)[0]]['roots']
	for (let i = 0; i < dataBokehRoots.length; i++) {
          dataBokehRoots[i]["attributes"]["sizing_mode"] = "stretch_both"
        }
        bokehScript = bokehScript.replace(dataJson, JSON.stringify(dataBokeh)) 
	let renderJson
        for (let i = 0; i < lines.length; i++) {
          if(lines[i].includes('const render_items =')) {
            renderJson = lines[i]
          }
        }
        renderJson = renderJson.substring(renderJson.indexOf('['), renderJson.lastIndexOf(';'))
        let renderBokeh = JSON.parse(renderJson)
	let renderId = Object.keys(renderBokeh[0]['roots'])[0]
	let divId = renderBokeh[0]['roots'][renderId]
	let newDivId = divId + "-new"
	renderBokeh[0]['roots'][renderId] = newDivId
        bokehScript = bokehScript.replace(renderJson, JSON.stringify(renderBokeh)) 

	const newDiv = document.createElement('div')
	newDiv.setAttribute('data-root-id', renderId)
	newDiv.setAttribute('id', newDivId)
	newDiv.style.display = 'contents'

        div.append(newDiv)

        var lines = bokehScript.split("\n")
	if (lines[0].startsWith('var element = document.getElementById')) {
	  lines.shift()
	  bokehScript = lines.join('\n')
        }
        var script = document.createElement('script')
        script.appendChild(document.createTextNode(bokehScript))
        document.body.appendChild(script)
      } else {
        div.appendChild(this.el)
      }
    } else {
      div.appendChild(this.el)
    }
    
    
    //wrapper.appendChild(div.cloneNode(true))
    //result.appendChild(wrapper.cloneNode(true))
    //wrapper.appendChild(div)
    //result.appendChild(wrapper)
    return div.innerHTML
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
    
    //const documentCopy = document.cloneNode(true)
    //const cellsDom = documentCopy.querySelectorAll('.jp-Cell')
    const cellsDom = document.querySelectorAll('.jp-Cell')
    var id = 0
    for(var i = 0; i < cellsDom.length; i++) {
      var cell = new Cell(cellsDom[i])
      var content = cell.pipeline()
      if (content) {
        cells.push({id: id, w: 6, h: 3, content: content})
	id = id + 1
      }
    }
    //const jpCells = document.querySelectorAll('body > div.jp-Cell');
    const jpCells = document.querySelectorAll('div.jp-Cell');
    
    jpCells.forEach(function (element) {
        element.remove();
      });

    var result = document.createElement('div');
    result.classList.add('grid-stack')
    result.setAttribute('v-scope', '')
    document.body.appendChild(result)


    var gridDef = {
      minRow: 1,
      cellHeight: '100px'
    }
    var gridTrashDef = {
      margin: 2,
      cellHeight: '70px',
      column: 1,
      disableDrag: true,
      disableResize: true
    }
    
    grid = GridStack.init(!isTrash ? gridDef : gridTrashDef)
    if (!isTrash) {
      if (typeof savedData !== 'undefined') {
        savedData.forEach(function(item) {
	  item.content = cells.find(element => element.id === item.id).content
        })
        grid.load(savedData)
      } else {
        grid.load(cells)
      }
    } else {
      var trashCells = []
      if (typeof savedData !== 'undefined') {
        trashCells = cells.filter(item => !savedData.some(f => f.id === item.id))
	console.log('aaaaa')
	console.log(trashCells)
      } else {
        trashCells = []
      }
      grid.load(trashCells)
    }
    
      grid.on('removed', function(event, items) {
	const functionToRun = !isTrash ? addToTrash : restoreFromTrash
        items.forEach(function(item) {
          functionToRun(item)
        })
      })
      window.addEventListener("resize", function(event){
        addGridEditStyle(grid)
	console.log('windows resize')
      }, true)

	    
	    //grid.removeAll()
	    /*
      console.log('malaaaaa')
      const removeCells = document.querySelectorAll('grid-stack-item')
      console.log(grid)
      removeCells.forEach(function (element) {
	console.log('kkkkkkkkkk')
	element.dontForward = true
        element.remove()
      })
      */
      return grid
}

function addGridEditStyle(grid) {
  /*
  if (!edit) {
    console.log('not edit')
    return
  }
  */
   var currentHeight = grid.opts.cellHeight
   var currentWidth = grid.cellWidth()
	/*
  var styles = `
.grid-stack {
  background: #efefef;
  background-image: linear-gradient(#ffffff .4rem, transparent .4rem), linear-gradient(90deg, #ffffff .4rem, transparent .4rem);
  background-size: \${currentWidth}px \${currentHeight}px;
}
  `
  */
  removeGridEditStyle()
  var styles = `
.grid-stack {
background-image: linear-gradient(#e0e0e0 1px, transparent 1px), linear-gradient(90deg, #e0e0e0 1px, transparent 0px), linear-gradient(rgba(255,255,255,.3) 5px, transparent 100px), linear-gradient(90deg, rgba(255,255,255,.3) 5px, transparent 100px);
background-size: 100px 100px, calc(8.33% + 0px) 100px, 20px 20px, 20px 20px;
background-position: -2px -2px, -1px -2px, -1px -1px, -1px -1px;}
}
  `
  var styleSheet = document.createElement("style")
  styleSheet.setAttribute("id", "gridStyleSheetId")
  styleSheet.innerText = styles
  document.head.appendChild(styleSheet)
  return
}

function removeGridEditStyle() {
  var styleToRemove = document.getElementById("gridStyleSheetId")
  if (styleToRemove) {
    styleToRemove.parentNode.removeChild(styleToRemove)
  }
}

function observeVega(element) {
  resizeVegaObserver.observe(element)
}

function observeEcharts(element) {
  resizeEchartsObserver.observe(element)
}

function observePlotly(element) {
  resizePlotlyObserver.observe(element)
}

let resizeVegaObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    var vegaEl = entry.target.querySelector('div').querySelector('div')
    var scriptStr = resizeVega(vegaEl)
    console.log('aaa')
    console.log(vegaEl)
    console.log('bbbb')
    eval(scriptStr)
  }
});

let resizeEchartsObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    var echartsEl = entry.target.querySelector('div').querySelector('div')
    var code = resizeEcharts(echartsEl)
    eval(code)
  }
});

let resizePlotlyObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    var plotlyEl = entry.target.querySelector('div').querySelector('div')
    var code = resizePlotly(plotlyEl)
    eval(code)
  }
});

function addResizes() {
  var elementsWithResize = document.querySelectorAll('[resize-type]')
  elementsWithResize.forEach(function (el) {
    addResize(el)
  })
}

function addResize(el) {
  var currentId = el.id
  if (resizedDone.indexOf(currentId) !== -1) {
    return
  }
  resizedDone.push(currentId)
  var resizeType = el.getAttribute('resize-type')
  switch (resizeType) {
    case "vega":
      observeVega(el.parentElement.parentElement)
      break
    case "echarts":
      observeEcharts(el.parentElement.parentElement)
      break
    case "plotly":
      observePlotly(el.parentElement.parentElement)
      break
    default:
      break
  }
}


function resizeEcharts(echartsEl) {
  var echartsId = echartsEl.getAttribute('id')
  var code = `
        require(['echarts'], function(echarts) {
            
          const container = document.getElementById('${echartsId}');
          const chart = echarts.init(container);
            new ResizeObserver(() => {
                chart.resize()
            }).observe(container)
        })
  `
  return code
}

function resizePlotly(plotlyEl) {
  var plotlyId = plotlyEl.getAttribute('id')
  var code = `
        require(['plotly'], function(Plotly) {
	  Plotly.Plots.resize(document.getElementById('${plotlyId}'))
        })
    `
  return code
}

function resizeVega(vegaEl) {
      var vegaId = vegaEl.getAttribute('id')
      console.log('vegaId')
      console.log(vegaId)
      var scriptStr = vegaEl.nextElementSibling.textContent
      scriptStr = scriptStr.replace(
	      'let outputDiv = document.currentScript.previousElementSibling;',
	      `let outputDiv = document.getElementById("${vegaId}");`
        )
      const lines = scriptStr.split("\n")
      let linePayload
      for (let i = 0; i < lines.length; i++) {
        if(lines[i].includes('{"mode": "vega-lite"}')) {
          linePayload = lines[i]
        }
      }
      if (linePayload) {
        const payloadStr = linePayload.substring(linePayload.indexOf('{'), linePayload.lastIndexOf(','))
        const payload = JSON.parse(payloadStr)
        payload["width"] = "container"
        payload["height"] = "container"
        scriptStr = scriptStr.replace(payloadStr, JSON.stringify(payload)) 
        scriptStr = `
            const currentVega = document.getElementById('${vegaId}');
            console.log("inside script")
            currentVega.style.width = currentVega.parentElement.clientWidth*0.98 + 'px'
            currentVega.style.height = currentVega.parentElement.clientHeight*0.98 + 'px'
            ${scriptStr}
        `
    }
    return scriptStr
}




function addToTrash(item) {
  var event = new CustomEvent('addToTrashEvent', { detail: item.el })
  window.parent.document.dispatchEvent(event)
}

function restoreFromTrash(item) {
  var event = new CustomEvent('restoreFromTrashEvent', { detail: item.el })
  window.parent.document.dispatchEvent(event)
}

function resume() {
  var saveData = [
	  {
	      "x": 6,
	      "y": 0,
	      "w": 6,
	      "h": 3,
	      "id": "2",
	 }
  ]
  //grid.load(saveData)
}


//PetiteVue.createApp().mount()
//import { createApp } from 'https://unpkg.com/petite-vue?module'
//createApp().mount()

function init() {
  originalSourceCode = document.documentElement.outerHTML
  grid = start()
  addResizes()
  //resume()

  if (!isTrash) {
    console.log('aaaa')
    console.log(edit)
    if (edit) {
      //removeAppBar()
      addEditStyle()
    } else {
      grid.disable()
      addAppBar()
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  init()
})


function cleanEl(el) {
  var toRemove = el.getElementsByClassName('top-right')[0]
  toRemove.remove()
  var t = ` 
    <div class="top-right">
      <button onclick="removeWidget(this.parentElement.parentElement)">Remove Me</button>
    </div>
  `
  var parser = new DOMParser()
  var doc = parser.parseFromString(t, 'text/html') 
  var bodyElement = doc.body
  el.appendChild(bodyElement.firstChild)
}

function addEditStyle() {
  addTrashAction()
  addGridEditStyle(grid)
}

function removeEditStyle() {
  removeTrashAction()
  removeGridEditStyle()
}

function addTrashAction() {
  var htmlString = ` 
    <div class="top-right">
      <button onclick="removeWidget(this.parentElement.parentElement)">Remove Me</button>
    </div>
  `
  var parser = new DOMParser()
  var gridStackItems = document.querySelectorAll('.grid-stack-item')
  gridStackItems.forEach(function(el) {
    var doc = parser.parseFromString(htmlString, 'text/html') 
    var bodyElement = doc.body
    el.appendChild(bodyElement.firstChild)
  })
}

function removeTrashAction() {
  document.querySelectorAll('.top-right').forEach(function (element) {
    element.remove()
  })
}

window.document.addEventListener('restoreEvent', handleRestoreEvent, false)
window.document.addEventListener('saveEvent', handleSaveEvent, false)

function handleRestoreEvent(event) {
  var el = event.detail
  cleanEl(el)
  grid.addWidget(el, {x:0, y: 0, w: 6, h:3})
  addResize(el.querySelector('div').querySelector('div'))
}

function handleSaveEvent(event) {
  var savedData = grid.save()
  savedData.forEach(object => {
    delete object['content'];
  })
  var event = new CustomEvent('downloadEvent', { detail: savedData })
  window.parent.document.dispatchEvent(event)
}

function addAppBar() {
  var htmlString = ` 
    <div class="app-bar">
      <button onclick = "goToEdit()">Toggle Nested Elements</button>
      <button id="toggleButton2">Toggle Nested Elements</button>
    </div>
  `
  var parser = new DOMParser()
  var doc = parser.parseFromString(htmlString, 'text/html') 
  var bodyElement = doc.body
  document.body.insertBefore(bodyElement.firstChild, document.body.firstChild)
}
