<template>
</template>

<script setup>
function pipeline (event) {
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
  window.document.addEventListener('goToEditEvent', pipeline, false)
})

onUnmounted(() => {
  window.document.removeEventListener('goToEditEvent', pipeline)
})
</script>
