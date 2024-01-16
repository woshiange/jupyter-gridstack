<template>
<p>loading...</p>
</template>

<script setup>
import { useNotebook } from '@/stores/notebook'
const notebookStore = useNotebook()

function handleUpload (event) {
  if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
    return
  }
  console.log('load')
  notebookStore.transformedNotebookFromEdit =  event.data.transformedNotebook
  console.log(notebookStore)
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
