<template>
<p>loading...</p>
</template>

<script setup>
function pipeline (event) {
  console.log('serbee')
    /*
        if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
          return
        }
    */
        console.log('1')
        console.log('2')

        //localStorage.setItem('transformedNotebook', event.data.transformedNotebook)
        parent.postMessage("uploadReady", "*")
}
onMounted(() => {
  console.log('hello from load')
  window.addEventListener('message', pipeline)
})

onUnmounted(() => {
  window.removeEventListener('message', pipeline)
})
</script>
