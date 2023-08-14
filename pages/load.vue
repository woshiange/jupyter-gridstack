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
        var responseEvent = new CustomEvent('localStorageReadyEvent')
        window.parent.document.dispatchEvent(responseEvent)
}
onMounted(() => {
  console.log('hello')
  window.document.addEventListener('message', pipeline, false)
})

onUnmounted(() => {
  window.document.removeEventListener('message', pipeline)
})
</script>
