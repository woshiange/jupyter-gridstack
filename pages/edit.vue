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
import { useNotebook } from '@/stores/notebook'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(false)
const iframeContent = ref('')
const iframeTrashContent = ref('')
const notebookStore = useNotebook()


function addToTrash (event) {
  const el = event.detail
  const eventSend = new CustomEvent('restoreEvent', { detail: el })
  const trashIframe = document.getElementById("trash-iframe")
  trashIframe.contentDocument.dispatchEvent(eventSend)
}

function restoreFromTrash (event) {
  const el = event.detail
  const eventSend = new CustomEvent('restoreEvent', { detail: el })
  const mainIframe = document.getElementById("main-iframe")
  mainIframe.contentDocument.dispatchEvent(eventSend)
}

function download (event) {
  const savedData = event.detail
  for (var i = 0; i < savedData.length; i++) {
    if (!savedData[i].hasOwnProperty("h")) {
      savedData[i].h = 1
    }
    if (!savedData[i].hasOwnProperty("w")) {
      savedData[i].w = 1
    }
  }
  const downloadNotebook = notebookStore.downloadNotebook(savedData).outerHTML

  // Download the file
  var blob = new Blob([downloadNotebook], { type: 'text/html' })
  var blobUrl = URL.createObjectURL(blob)
  var downloadLink = document.createElement('a')
  downloadLink.href = blobUrl
  downloadLink.download = 'downloaded.html'
  downloadLink.click()
  URL.revokeObjectURL(blobUrl)
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

onMounted(() => {
  if(!notebookStore.notebook) {
    router.push({ name: 'index' })
  }
  window.document.addEventListener('addToTrashEvent', addToTrash, false)
  window.document.addEventListener('restoreFromTrashEvent', restoreFromTrash, false)
  window.document.addEventListener('downloadEvent', download, false)

  iframeContent.value = notebookStore.transformedNotebook.outerHTML
  iframeTrashContent.value = notebookStore.trashNotebook.outerHTML
  editGrid()
});

onUnmounted(() => {
  window.document.removeEventListener('addToTrashEvent', addToTrash)
  window.document.removeEventListener('restoreFromTrashEvent', restoreFromTrash)
  window.document.removeEventListener('downloadEvent', download)
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
