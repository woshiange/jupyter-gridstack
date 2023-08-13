<template>
</template>

<script>
export default {
  methods: {
    addEventSetLocalStorage () {
      window.addEventListener('message', function(event) {
        if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
          return
        }
        localStorage.setItem('transformedNotebook', event.data.transformedNotebook)
        parent.postMessage("localStorageReady", "*")
      }, false)
    },
    sendEditReady () {
      parent.postMessage("editReady", "*")
    },
  },
  mounted() {
    this.sendEditReady()
    this.addEventSetLocalStorage()
  },
  unmounted() {
    window.document.removeEventListener('message')
  }
}
</script>

