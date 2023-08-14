<template>
<p>loading...</p>
</template>

<script setup>
function handleUpload (event) {
  if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
    return
  }
  //localStorage.setItem('transformedNotebook', event.data.transformedNotebook)
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
