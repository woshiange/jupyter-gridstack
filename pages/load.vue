<template>
</template>

<script>
export default {
  methods: {
    addEventSetLocalStorage () {
      window.addEventListener('message', function(event) {
        console.log('kurde')
        console.log(event)
        if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
          return
        }
        localStorage.setItem('transformedNotebook', event.data.transformedNotebook)
        parent.postMessage("localStorageReady", "*")
      }, false)
    }
  },
  mounted() {
    this.addEventSetLocalStorage()
  },
  unmounted() {
    window.document.removeEventListener('message')
  }
}
</script>

