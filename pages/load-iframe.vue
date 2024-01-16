<template>
<p>loading...</p>
</template>

<script setup>
function handleUpload (event) {
  if (!(typeof event.data == 'object' && event.data.call=='sendData')) {
    return
  }
  console.log('load')
  upload(event.data.transformedNotebook)
}

function upload (transformedNotebook) {
  const dbPromise = indexedDB.open('jupyterGrid')
  dbPromise.onupgradeneeded = (event) => {
    const database = event.target.result;
    // Check if the object store exists, and create it if necessary
    if (!database.objectStoreNames.contains('notebooks')) {
      database.createObjectStore('notebooks')
    }
  };
  dbPromise.onsuccess = (event) => {
    const database = event.target.result
    const transaction = database.transaction('notebooks', 'readwrite');
    const objectStore = transaction.objectStore('notebooks');

    // Check if the record with key 'transformedNotebook' exists
    const request = objectStore.get('transformedNotebook');
    request.onsuccess = (e) => {
      const existingRecord = e.target.result;

      if (existingRecord) {
        // If the record exists, delete it
        const deleteRequest = objectStore.delete('transformedNotebook');
      }
    }
    transaction.oncomplete = () => {
      console.log('upload done');
      parent.postMessage('uploadReady', '*');
    };
    transaction.onerror = (error) => {
      console.error('Transaction error:', error);
    };
    objectStore.add(transformedNotebook, 'transformedNotebook');
  }
}
onMounted(() => {
  parent.postMessage("editReady", "*")
  window.addEventListener('message', handleUpload)
})

onUnmounted(() => {
  window.removeEventListener('message', handleUpload)
})
</script>
