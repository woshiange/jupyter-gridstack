<template>
  <v-layout>
    <v-main class="iframe-container">
      <iframe id="main-iframe" class="full-iframe" :srcdoc="iframeContent" frameborder="0"></iframe>
    </v-main>
  </v-layout>
</template>

<script setup>
import { useNotebook } from '@/stores/notebook'
import { useRouter } from 'vue-router'

const router = useRouter()
const iframeContent = ref('')
const notebookStore = useNotebook()


onMounted(() => {
  if(!(notebookStore.notebook || notebookStore.urlNotebook)) {
    router.push({ name: 'index' })
  }
  if(notebookStore.notebook) {
    iframeContent.value = notebookStore.transformedNotebook
  } else {
    iframeContent.value = notebookStore.notebookFromUrl
  }
});

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
