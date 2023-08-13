<template>
  <v-layout>
    <v-app-bar prominent>
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-app-bar-title>
        <v-btn
          icon="mdi-dots-vertical"
          @click="editGrid"
        />
        <v-btn
          icon="mdi-dots-vertical"
          @click="save"
        />
      </v-app-bar-title>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      location="left"
      temporary
    >
      <iframe id="trash-iframe" class="full-iframe" :srcdoc="iframeTrashContent" frameborder="0"></iframe>
    </v-navigation-drawer>
    <v-main class="iframe-container">
      <iframe id="main-iframe" class="full-iframe" :srcdoc="iframeContent" frameborder="0"></iframe>
    </v-main>
  </v-layout>
</template>

<script setup>
import { addToBody, mainScript } from '@/utils.js'
const drawer = ref(false)
const iframeContent = ref('')
const iframeTrashContent = ref('')


function addToTrash (event) {
  const el = event.detail
  const eventSend = new CustomEvent('addToTrashEvent', { detail: el })
  const trashIframe = document.getElementById("trash-iframe")
  trashIframe.contentDocument.dispatchEvent(eventSend)
}

function restore (event) {
  const el = event.detail
  const eventSend = new CustomEvent('restoreEvent', { detail: el })
  const mainIframe = document.getElementById("main-iframe")
  mainIframe.contentDocument.dispatchEvent(eventSend)
}

function savedData (event) {
  const savedData = event.detail
  for (var i = 0; i < savedData.length; i++) {
    if (!savedData[i].hasOwnProperty("h")) {
      savedData[i].h = 1
    }
    if (!savedData[i].hasOwnProperty("w")) {
      savedData[i].w = 1
    }
  }
  setNewTransformedNotebook(savedData)
}

function save () {
  const eventSend = new CustomEvent('saveEvent')
  const mainIframe = document.getElementById("main-iframe")
  mainIframe.contentDocument.dispatchEvent(eventSend)
}

function editGrid () {
  console.log('edit grid')
  const eventSend = new CustomEvent('editGridEvent')
  const mainIframe = document.getElementById("main-iframe")
  mainIframe.contentDocument.dispatchEvent(eventSend)
}

function setNewTransformedNotebook (savedData) {
  const notebookHtml = localStorage.getItem('notebook');
  const parser = new DOMParser();

  const htmlDocument = parser.parseFromString(notebookHtml, 'text/html');

  const rootElement = htmlDocument.documentElement;
  const link = document.createElement('link');
  link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
  link.rel = 'stylesheet'
  //rootElement.getElementsByTagName('head')[0].appendChild(link);
  const script = document.createElement('script')
  script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
  //rootElement.getElementsByTagName('head')[0].appendChild(script);
  const referenceNode = rootElement.querySelector('meta[name="viewport"]')
  referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
  referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
  //rootElement.getElementsByTagName('head')[0].append(link, script);
  rootElement.getElementsByTagName('body')[0].innerHTML += `<script>var edit = false<\/script>`
  rootElement.getElementsByTagName('body')[0].innerHTML += addToBody
  const scriptSavedData = document.createElement('script')
  scriptSavedData.type = 'text/javascript'
  var jsCode = `var savedData = ${JSON.stringify(savedData)}`
  scriptSavedData.textContent = jsCode
  rootElement.getElementsByTagName('body')[0].appendChild(scriptSavedData)
  const scriptBody = document.createElement('script')
  scriptBody.defer = true
  scriptBody.textContent = mainScript
  scriptBody.type = 'module'
  rootElement.getElementsByTagName('body')[0].appendChild(scriptBody);
  localStorage.setItem('transformedNotebook', rootElement.outerHTML)

  // Download the file
  var blob = new Blob([rootElement.outerHTML], { type: 'text/html' })
  var blobUrl = URL.createObjectURL(blob)
  var downloadLink = document.createElement('a')
  downloadLink.href = blobUrl
  downloadLink.download = 'downloaded.html'
  downloadLink.click()
  URL.revokeObjectURL(blobUrl)
}

onMounted(() => {
  // Load the HTML content from localStorage when the component is mounted
  const transformedNotebookHtml = localStorage.getItem('transformedNotebook');
  const trashNotebookHtml = localStorage.getItem('trashNotebook');
  window.document.addEventListener('addToTrashEvent', addToTrash, false)
  window.document.addEventListener('restoreEvent', restore, false)
  window.document.addEventListener('savedDataEvent', savedData, false)

  // Check if the content is available, and set it to the iframeContent
  if (transformedNotebookHtml) {
    iframeContent.value = transformedNotebookHtml;
    editGrid()
  }
  if (trashNotebookHtml) {
    //console.log(trashNotebookHtml)
    iframeTrashContent.value = trashNotebookHtml;
  }
});

onUnmounted(() => {
  window.document.removeEventListener('addToTrashEvent', addToTrash)
  window.document.removeEventListener('restoreEvent', restore)
  window.document.removeEventListener('savedDataEvent', savedData)
})
</script>

<style scoped>
/* Set the container to occupy the full height and width of the viewport */
.iframe-container {
  height: 100vh; /* 100% of the viewport height */
  width: 100vw; /* 100% of the viewport width */
}

/* Set the iframe to fill its container */
.full-iframe {
  height: 100%;
  width: 100%;
}
</style>
