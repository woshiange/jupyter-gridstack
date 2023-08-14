<template>
</template>

<script>
export default {
  methods: {
    pipeline (event) {
    /*
        if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
          return
        }
    */
        if (!(typeof event.type == 'message' && event.data ==='sendData')) {
          return
        }
        console.log('ok')

        localStorage.setItem('transformedNotebook', event.data.transformedNotebook)
        parent.postMessage("localStorageReady", "*")
    }
  },
  mounted() {
    window.addEventListener('message', pipeline, false)
  },
  unmounted() {
    window.document.removeEventListener('message', pipeline)
  }
}
</script>

