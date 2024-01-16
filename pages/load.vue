<template>
<p>loading...</p>
</template>

<script setup>
import { useNotebook } from '@/stores/notebook'
const notebookStore = useNotebook()

function handleUpload (event) {
  console.log('load start')
  if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
    return
  }
  console.log('load')
  console.log(event)
  console.log(event.data.transformedNotebook)
  notebookStore.transformedNotebookFromEdit =  event.data.transformedNotebook
  parent.postMessage("uploadReady", "*")
}
onMounted(() => {
  parent.postMessage("editReady", "*")
  window.addEventListener('message', handleUpload)
})

onUnmounted(() => {
  window.removeEventListener('message', handleUpload)
})
</script>
