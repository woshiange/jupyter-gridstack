const isWebsite = typeof fromWebsite !== 'undefined'
var grid
var gridTrash
const cells = []

function getElementByXpath(path, doc) {  
  return doc.evaluate(path, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue 
}

function addCss() {
var styles = `
body {
  margin-left: 0 !important;
  margin-right: 0 !important;
  margin-bottom: 0 !important;
  margin-top: 60px !important;
  padding: 0 !important;
}
body.drawer-open {
  overflow: hidden;
}
.top-right {
  position: absolute;
  top: -4px;
  right: 15px;
  z-index: 3;
}
.top-right .iconify {
  width: 30px;
  height: 30px;
  background: rgb(255, 255, 255);
  border-radius: 50px;
  border: 1px solid #000;
  cursor: pointer;
}
#topBar {
  height: 40px;
  background-color: rgba(80, 158, 227);
  z-index: 999;
  padding: 10px;
  position: fixed;
  width: 100%;
  top: 0;
  display: flex;
  align-items: center;
}
.grid-stack-item-content {
  background-color: #f1f1f1;
  border-radius: 10px;
  border-style: solid;
  box-shadow: 0px 1px 3px rgb(0 0 0 / 13%);
}
#drawer {
  position: fixed;
  top: 60px;
  left: -300px;
  width: 300px;
  height: 100%;
  background-color: #f0f0f0;
  transition: left 0.3s ease;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 998;
  overflow-y: auto;
}
#drawer ul {
  list-style: none;
  padding: 20px;
  margin: 0;
}
#overlay {
  display: none;
  position: fixed;
  top: 40px;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 997;
}
.app-bar-button {
  width: 40px;
}
.centered {
  width: 100%;
  display: flex;
  justify-content: center;
  color: rgb(255, 255, 255);
  font-weight: bold;
  align-items: center;
}
.hidden {
  display: none !important;
}
#notebookContainer {
  height: 100vh;
  width: 100vw;
}
#notebookIframe {
  height: 100%;
  width: 100%;
}
.overlay-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 1;
}
.grid-stack-item {
  position: relative;
}
.grid-stack-main .overlay-card {
  cursor: grab;
}
.default-cell {
  display: flex;
  justify-content: center;
}
.white-bg {
  transition: background-color 0.3s ease;
  background-color: rgb(255, 255, 255);
  color: rgb(80, 158, 227);
  cursor: pointer;
}
#doneBtn {
  border: none;
  border-radius: 10%;
  font-weight: bold;
  padding: 10px;
  margin-left: 10px;
}
.iconify.white-bg {
  border-radius: 30%;
  width: 30px;
  height: 30px;
}
.white-bg:hover {
  background-color: rgb(80, 158, 227);
  color: white;
}
#topBarEdit {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
#topBarView {
  position: relative;
  width: 100%;
}
#closeBtn {
  position: absolute;
  top: -5px;
  right: 15px;
}
#closeBtn .iconify {
  color: rgb(255, 255, 255);
  width: 30px;
  height: 30px;
  cursor: pointer;
}
.tooltip-container {
  position: relative;
}
.tooltip {
  visibility: hidden;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}
.tooltip-container:hover .tooltip {
  visibility: visible;
  opacity: 1;
}
#viewDashboardBtn {
  margin-left: 30px
}
#editBtn {
  margin-left: 30px
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
      const newDiv = document.createElement('div')
      newDiv.classList.add('default-cell')
      newDiv.appendChild(this.el)
      div.appendChild(newDiv)
    }
    
    
    return div.innerHTML
  }
}

function start() {
    addCss()

    var result = document.createElement('div');
    result.classList.add('grid-stack')

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

    const jpCells = document.querySelectorAll('div.jp-Cell');
    
    jpCells.forEach(function (element) {
        element.remove();
      });

    var result = document.createElement('div');
    result.classList.add('grid-stack-main')
    result.setAttribute('v-scope', '')
    document.body.appendChild(result)

    var htmlString = ` 
      <div id="notebookContainer" class="hidden">
        <iframe id="notebookIframe" frameborder="0"></iframe>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', htmlString)


    var gridDef = {
      minRow: 1,
      cellHeight: '100px',
      animate: false,
      columnOpts: {
	breakpointForWindow: true,
        breakpoints: [{w:700, c:1}]
      }
    }
    var gridTrashDef = {
      margin: 2,
      cellHeight: '70px',
      column: 1,
      disableDrag: true,
      disableResize: true
    }
    
    grid = GridStack.init(gridDef, '.grid-stack-main')
    gridTrash = GridStack.init(gridTrashDef, '.grid-stack-trash')

      if (typeof savedData !== 'undefined') {
        savedData.forEach(function(item) {
	  item.content = cells.find(element => element.id === item.id).content
        })
        grid.load(savedData)
      } else {
        grid.load(cells)
      }

      var trashCells = []
      if (typeof savedData !== 'undefined') {
        trashCells = cells.filter(item => !savedData.some(f => f.id === item.id))
      } else {
        trashCells = []
      }
      gridTrash.load(trashCells)

      window.addEventListener("resize", function(event){
        if(edit) {
          addGridEditStyle(grid)
        }
      }, true)

	    
      return grid
}

function addGridEditStyle(grid) {
   var currentHeight = grid.opts.cellHeight
   var currentWidth = grid.cellWidth()
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

function trashHasItem () {
  var gridTrash = document.querySelector('.grid-stack-trash')
  var gridItems = gridTrash.querySelectorAll('.grid-stack-item')
  return gridItems.length > 0
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
  var resizeType = el.getAttribute('resize-type')
  console.log('resizeType')
  console.log(resizeType)
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




function init() {
  //saveToIndexedDb(document.documentElement.outerHTML)
  saveToIndexedDb()
  addHtml()
  grid = start()
  addResizes()
  addJs()

  if (edit) {
    addEditStyle()
  } else {
    grid.disable()
  }
}

document.addEventListener('DOMContentLoaded', function() {
  init()
})



function addEditStyle() {
  addCardEditStyle()
  addGridEditStyle(grid)
}

function removeEditStyle() {
  removeCardEditStyle()
  removeGridEditStyle()
}

function addCardEditStyle() {
  var htmlTopRight = ` 
    <div class="top-right">
      <span class="iconify" data-icon="mdi-close-circle-outline" onclick="switchGrid(this.parentElement.parentElement)"></span>
    </div>
  `
  var htmlOverlayCard = ` 
    <div class="overlay-card"></div>
  `
  var gridStackItems = document.querySelectorAll('.grid-stack-item')
  var gridStackItemContents = document.querySelectorAll('.grid-stack-item-content')
  gridStackItems.forEach(function(el) {
    var stringToAdd
    if(el.parentElement.classList.contains('grid-stack-trash')) {
      stringToAdd = htmlTopRight.replace("mdi-close-circle-outline", "mdi-delete-restore")
    }
    else stringToAdd = htmlTopRight
    el.insertAdjacentHTML('beforeend', stringToAdd)
  })
  gridStackItemContents.forEach(function(el) {
    el.insertAdjacentHTML('beforeend', htmlOverlayCard)
  })
}

function switchGrid(el) {
  var currentGrid
  var nextGrid
  var iconHtml
  el.querySelector('.iconify').remove()
  var topRight = el.querySelector('.top-right')
  var trashBtn = document.getElementById('trashBtn')
  el.setAttribute('gs-x', '0')
  el.setAttribute('gs-y', '0')
  el.setAttribute('gs-w', '6')
  el.setAttribute('gs-h', '3')
  if(el.parentElement.classList.contains('grid-stack-main')) {
    currentGrid = grid
    nextGrid = gridTrash
    iconHtml = '<span class="iconify" data-icon="mdi-delete-restore" onclick="switchGrid(this.parentElement.parentElement)"></span>'
    if (trashBtn.classList.contains('hidden')) {
      trashBtn.classList.toggle('hidden')
    }
  } else {
    currentGrid = gridTrash
    nextGrid = grid
    iconHtml = '<span class="iconify" data-icon="mdi-close-circle-outline" onclick="switchGrid(this.parentElement.parentElement)"></span>'
  }
  topRight.insertAdjacentHTML('beforeend', iconHtml)
  currentGrid.removeWidget(el)
  nextGrid.addWidget(el)
  if(!trashHasItem()) {
    if (!(trashBtn.classList.contains('hidden'))) {
      trashBtn.classList.toggle('hidden')
    }
  }
}

function removeCardEditStyle() {
  document.querySelectorAll('.top-right').forEach(function (element) {
    element.remove()
  })
  document.querySelectorAll('.overlay-card').forEach(function (element) {
    element.remove()
  })
}



function saveToIndexedDb () {
  const notebook = decodeURIComponent(escape(window.atob(encodedNotebook)))
  const dbPromise = indexedDB.open('jupyterGrid')
  dbPromise.onupgradeneeded = (event) => {
    const database = event.target.result;
    // Check if the object store exists, and create it if necessary
    if (!database.objectStoreNames.contains('notebooks')) {
      database.createObjectStore('notebooks')
    }
  };
  dbPromise.onsuccess = (event) => {
    const database = event.target.result
    const transaction = database.transaction('notebooks', 'readwrite');
    const objectStore = transaction.objectStore('notebooks');

    objectStore.put(notebook, 'notebook');
  }
}

function getSavedData() {
  var savedData = grid.save()
  savedData.forEach(object => {
    delete object['content'];
  })
  return savedData
}

function download() {
  const dbPromise = indexedDB.open('jupyterGrid')

  dbPromise.onsuccess = (event) => {
    const database = event.target.result
    const transaction = database.transaction('notebooks', 'readwrite');
    const objectStore = transaction.objectStore('notebooks');

    const request = objectStore.get('notebook');
    request.onsuccess = (e) => {
      const notebook = e.target.result
      const parser = new DOMParser()
      const htmlDocument = parser.parseFromString(notebook, 'text/html')
      const rootElement = htmlDocument.documentElement
      const link = document.createElement('link');
      link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
      link.rel = 'stylesheet'
      const script = document.createElement('script')
      script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
      const scriptSelf = document.createElement('script')
      scriptSelf.src = 'https://jupyter-gridstack.pages.dev/1.0/zlatko.js'
      //scriptSelf.src = 'http://localhost:3000/1.0/zlatko.js'
      scriptSelf.defer = true
      const scriptIconify = document.createElement('script')
      scriptIconify.src = 'https://code.iconify.design/1/1.0.6/iconify.min.js'
      const referenceNode = rootElement.querySelector('meta[name="viewport"]')
      referenceNode.parentNode.insertBefore(scriptIconify, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(scriptSelf, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
      const scriptSavedData = document.createElement('script')
      scriptSavedData.textContent = "var savedData = " + JSON.stringify(getSavedData())
      var bodyElement = rootElement.getElementsByTagName('body')[0]
      bodyElement.insertBefore(scriptSavedData, bodyElement.firstChild)
      const scriptFileName= document.createElement('script')
      scriptFileName.textContent = `var fileName = '${fileName}'`
      bodyElement.insertBefore(scriptFileName, bodyElement.firstChild)
      const scriptEdit = document.createElement('script')
      scriptEdit.textContent = "var edit = false"
      bodyElement.insertBefore(scriptEdit, bodyElement.firstChild)
      const scriptEncodedNotebook = document.createElement('script')
      scriptEncodedNotebook.textContent = `var encodedNotebook = '${encodedNotebook}'`
      bodyElement.appendChild(scriptEncodedNotebook)

      var blob = new Blob([rootElement.outerHTML], { type: 'text/html' })
      //var blob = new Blob([doc.body.firstChild.outerHTML], { type: 'text/html' })
      var blobUrl = URL.createObjectURL(blob)
      var downloadLink = document.createElement('a')
      downloadLink.href = blobUrl
      downloadLink.download = fileName + '_dashboard.html'
      downloadLink.click()
      URL.revokeObjectURL(blobUrl)
    }
  }
}

function populateNotebookIframe() {
  const dbPromise = indexedDB.open('jupyterGrid')

  dbPromise.onsuccess = (event) => {
    const database = event.target.result
    const transaction = database.transaction('notebooks', 'readwrite');
    const objectStore = transaction.objectStore('notebooks');

    const request = objectStore.get('notebook');
    request.onsuccess = (e) => {
      const notebook = e.target.result
      var notebookIframe = document.getElementById("notebookIframe")
      notebookIframe.srcdoc = notebook
    }
  }
}



function addHtml() {
  var htmlString = ` 
    <div id="topBar">
      <div id="topBarEdit">
        <div class="app-bar-button">
          <span id="trashBtn"><span class="iconify white-bg" data-icon="mdi-trash-can-outline"></span></span>
        </div>
        <div class="centered">
          <span class="iconify" data-icon="mdi-pencil-outline"></span>
          You're editing this dashboard. 
          <button id="doneBtn" class="white-bg">Done</button>
        </div>
        <div class="app-bar-button">
        </div>
      </div>
      <div id="topBarView">
        <span id="viewDashboardBtn" class="hidden tooltip-container">
          <span class="iconify white-bg" data-icon="mdi-view-dashboard-outline"></span>
	  <span class="tooltip">View Dashboard</span>
        </span>
        <span id="editBtn" class="tooltip-container">
	  <span class="iconify white-bg" data-icon="mdi-pencil-outline"></span>
	  <span class="tooltip">Edit Dashboard</span>
	</span>
        <span id="viewNotebookBtn" class="tooltip-container">
          <span class="iconify white-bg" data-icon="mdi-view-agenda-outline"></span>
	  <span class="tooltip">View Notebook</span>
        </span>
        <span id="downloadBtn" class="tooltip-container">
          <span class="iconify white-bg" data-icon="mdi-download-outline"></span>
	  <span class="tooltip">Download</span>
        </span>
        <span id="closeBtn"><span class="iconify" data-icon="mdi-close-circle-outline"></span></span>
      </div>
    </div>
    <div id="overlay"></div>
    <div id="drawer">
        <div class="grid-stack-trash"></div>
    </div>
  `
  document.body.insertAdjacentHTML('afterbegin', htmlString)
}

function addJs() {
        var trashBtn = document.getElementById('trashBtn');
        var editBtn = document.getElementById('editBtn');
        var doneBtn = document.getElementById('doneBtn');
        var downloadBtn = document.getElementById('downloadBtn');
        var viewNotebookBtn = document.getElementById('viewNotebookBtn');
        var viewDashboardBtn = document.getElementById('viewDashboardBtn');
        var closeBtn = document.getElementById('closeBtn');
        var drawer = document.getElementById('drawer');
        var overlay = document.getElementById('overlay')
        var topBarEdit = document.getElementById('topBarEdit')
        var topBarView = document.getElementById('topBarView')
        var body = document.body


/*
	if(!trashHasItem()) {
	  trashBtn.classList.toggle('hidden')
	}
*/
	if(edit) {
	  //downloadBtn.style.display = 'none'
	  topBarView.classList.toggle('hidden')
	} else {
	  topBarEdit.classList.toggle('hidden')
	  //trashBtn.classList.toggle('hidden')
	}
        if(isWebsite){
	  closeBtn.classList.toggle('hidden')
        }

        trashBtn.addEventListener('click', function () {
            var currentLeft = parseInt(getComputedStyle(drawer).left)

            if (currentLeft < 0) {
                drawer.style.left = '0';
                overlay.style.display = 'block'
                body.classList.add('drawer-open')
            } else {
                drawer.style.left = '-300px';
                overlay.style.display = 'none'
                body.classList.remove('drawer-open')
            }
        });
        doneBtn.addEventListener('click', function () {
          edit = !edit
          removeEditStyle()
          grid.disable()
	  topBarView.classList.toggle('hidden')
	  topBarEdit.classList.toggle('hidden')
	  //trashBtn.classList.toggle('hidden')
	})
        editBtn.addEventListener('click', function () {
          edit = !edit
          addEditStyle()
          grid.enable()
	  topBarView.classList.toggle('hidden')
	  topBarEdit.classList.toggle('hidden')
	  if(trashBtn.classList.contains('hidden') && trashHasItem()) {
	    trashBtn.classList.toggle('hidden')
	  }
        });
        viewNotebookBtn.addEventListener('click', function () {
	  var gridStackMain = document.querySelector('.grid-stack-main')
	  var notebookContainer = document.getElementById("notebookContainer")
	  var notebookIframe = document.getElementById("notebookIframe")
	  if (notebookIframe.srcdoc === '') {
	    populateNotebookIframe()
	  }
	  gridStackMain.classList.toggle('hidden')
	  notebookContainer.classList.toggle('hidden')
	  editBtn.classList.toggle('hidden')
	  viewNotebookBtn.classList.toggle('hidden')
	  viewDashboardBtn.classList.toggle('hidden')
        });
        viewDashboardBtn.addEventListener('click', function () {
	  var gridStackMain = document.querySelector('.grid-stack-main')
	  var notebookContainer = document.getElementById("notebookContainer")
	  notebookContainer.classList.toggle('hidden')
	  gridStackMain.classList.toggle('hidden')
	  editBtn.classList.toggle('hidden')
	  viewNotebookBtn.classList.toggle('hidden')
	  viewDashboardBtn.classList.toggle('hidden')
	})
        closeBtn.addEventListener('click', function () {
          var appBar = document.getElementById('topBar')
	  appBar.classList.toggle('hidden')
          document.body.style.setProperty('margin-top', '0', 'important')
        })
        downloadBtn.addEventListener('click', function () {
	  download()
        })

        document.addEventListener('click', function (event) {
            //var drawer = document.getElementById('drawer');
            // Close the drawer if the click is outside the drawer and the drawer is open
            if (event.target !== trashBtn && !drawer.contains(event.target) && parseInt(getComputedStyle(drawer).left) === 0) {
                drawer.style.left = '-300px';
                overlay.style.display = 'none'
                body.classList.remove('drawer-open')
            }
        });
}
