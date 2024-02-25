<template>
  <v-container fluid class="main d-flex flex-column pa-0" style="height: 100vh;">
    <h1 class="d-flex justify-center mt-15">Jupyter Notebook Converter</h1>
    <p class="d-flex justify-center">Turn your notebook into a beautiful presentation.</p>
    <div
      class="dropzone-container d-flex mt-5"
      @dragover="dragover"
      @dragleave="dragleave"
      @drop="drop"
    >
      <input
        type="file"
        name="file"
        id="fileInput"
        class="hidden-input"
        @change="onChange"
        ref="file"
        accept=".ipynb, .html"
      />

      <label for="fileInput" class="file-label">
        <div class="d-flex justify-center">
          <div v-if="isDragging">Release to drop files here.</div>
          <div v-else>
            <div v-if="file === null">
              <u>Drop your notebook here or click to upload.</u>
            </div>
            <div v-else>
              <v-progress-circular indeterminate></v-progress-circular>
              <span>{{loaderMessage}}</span>
            </div>
          </div>
        </div>
      </label>
    </div>
    <v-container fluid class="bg-surface-variant mt-10">
    <h2 class="d-flex justify-center">Example Gallery</h2>
    <div class="d-flex justify-center mt-3">
      <div style="max-width: 900px">
      <v-row justify="center">
        <v-col v-for="dashboard in dashboards"
          cols="12"
          sm="5"
          class="d-flex justify-center"
        >
          <DashboardCard
            :title="dashboard.title"
            :imageUrl="dashboard.imageUrl"
	    :linkUrl="dashboard.linkUrl"
          />
        </v-col>
      </v-row>
      </div>
    </div>
  </v-container>
  </v-container>
</template>

<script scoped>
import { mapStores } from 'pinia'
export default {
  data() {
    return {
      isDragging: false,
      files: [],
      file: null,
      fileContent: null,
      loaderMessage: '',
      dashboards: [
        {"title": "stefan", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/iowa_liquor_sales_dashboard.jpg"},
        {"title": "stefan", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/iowa_liquor_sales_dashboard.jpg"},
        {"title": "stefan", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/iowa_liquor_sales_dashboard.jpg"},
        {"title": "stefan", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/iowa_liquor_sales_dashboard.jpg"},
      ]
    };
  },
  computed: {
    fileName() {
      return this.file.name.split('.')[0]
    },
    fileExtension() {
      return this.file.name.split('.').at(-1).toLowerCase()
    },
    ...mapStores(useNotebook)
  },
  methods: {
    onChange() {
      this.files = [...this.$refs.file.files];
      this.file = this.files[0]
    },
    dragover(e) {
      e.preventDefault();
      this.isDragging = true;
    },
    dragleave() {
      this.isDragging = false;
    },
    drop(e) {
      e.preventDefault();
      this.$refs.file.files = e.dataTransfer.files;
      this.onChange();
      this.isDragging = false;
    },
    async convertIpynbTokHtml (notebookIpynb) {
      const response = await this.$axios.$post(
        'https://asia-southeast2-dataviz-374817.cloudfunctions.net/ipynb_to_html',
        { notebookSource: notebookIpynb }
      )
      return this.fileContent = response
    },
    getNotebook () {
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(this.fileContent, 'text/html');
      const rootElement = htmlDocument.documentElement;
      return rootElement
    },
    savegetTrashNotebook () {
      const parser = new DOMParser();

// Step 2: Parse the string variable as an XML document
      const htmlDocument = parser.parseFromString(this.fileContent, 'text/html');

// Step 3: Extract the document element (root) from the parsed XML document
      const rootElement = htmlDocument.documentElement;
      const link = document.createElement('link');
      link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
      link.rel = 'stylesheet'
      //rootElement.getElementsByTagName('head')[0].appendChild(link);
      const script = document.createElement('script')
      script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
      //rootElement.getElementsByTagName('head')[0].appendChild(script);
      const referenceNode = rootElement.querySelector('meta[name="viewport"]')
      referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
      //rootElement.getElementsByTagName('head')[0].append(link, script);
      const scriptBody = document.createElement('script')
      scriptBody.defer = true
      scriptBody.src = 'http://0.0.0.0:8000/trash.js'
      rootElement.getElementsByTagName('body')[0].appendChild(scriptBody);
      return rootElement
    }
  },
  watch: {
    file() {
      console.log('file')
      const reader = new FileReader()
      reader.onload = () => {
        if(this.fileExtension === 'ipynb') {
          this.loaderMessage = 'Converting Ipynb to Html...'
          this.convertIpynbTokHtml(reader.result)
        } else {
          this.loaderMessage = '   Loading...'
          this.fileContent = reader.result
        }
      }
      reader.readAsText(this.file)
    },
    fileContent() {
      console.log("fileContent")
      this.notebookStore.notebook = this.getNotebook().outerHTML
      this.notebookStore.fileName = this.fileName
      this.$router.push({ name: 'edit' })
    }
  }
};
</script>

<style scoped>
.dropzone-container {
    padding: 4rem;
    background: #f7fafc;
    border: 1px solid #e2e8f0;
    margin: 0 auto;
    width: 50%;
    background-color: ##C5CAE9;
}

.hidden-input {
    opacity: 0;
    overflow: hidden;
    position: absolute;
    width: 1px;
    height: 1px;
}

.file-label {
    font-size: 20px;
    display: block;
    cursor: pointer;
    margin: 0 auto;
    width: 100%;
}
</style>

