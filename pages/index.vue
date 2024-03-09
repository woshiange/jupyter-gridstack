<template>
  <v-container>
  <v-row>
    <v-col
      sm="12"
    >
      <h1 :class="(mdAndDown ? 'text-h3 mt-5' : 'text-h1 mt-15') + ' title'">
        Turn your Jupyter Notebook into a beautiful
        <span style="color: #509EE3;">dashboard.</span>
      </h1>
    </v-col>
    <v-col
      cols="12"
      sm="7"
    >
      <p class="description text-h5">Drag and resize the elements of your notebook to create a dashboard, no additional code is required.</p>
      <div
        class="dropzone-container d-flex mt-10"
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
    </v-col>
    <v-col
      cols="12"
      sm="5"
      class="d-flex justify-center"
    >
      <video width="100%" loop autoplay muted class="mt-10 elevation-6">
        <source src="/videos/tutorial.webm" type="video/webm">
        Your browser does not support the video tag.
      </video>
    </v-col>
  </v-row>
  <v-row justify="center" class="mt-10">
    <v-col
      sm="12"
      class="text-center"
    >
      <hr width="30%" class="mx-auto">
      <h2 class="mt-5 example-gallery">Example Gallery</h2>
    </v-col>
  </v-row>
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
  </v-container>
</template>

<script scoped>
import { mapStores } from 'pinia'
import { useDisplay } from 'vuetify'
export default {
  data() {
    return {
      mdAndDown: false,
      isDragging: false,
      files: [],
      file: null,
      fileContent: null,
      loaderMessage: '',
      dashboards: [
        {"title": "Singapore at a Glance", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/singapore_at_a_glance.webp"},
        {"title": "Fuel Prices in France", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/fuel_prices_in_france.webp"},
        {"title": "Iowa Liquor Retail Sales", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/iowa_liquor_retail_sales.webp"},
        {"title": "Los Angeles Homicides", "linkUrl": "/dashboards/iowa_liquor_sales_dashboard.html", "imageUrl": "/images/los_angeles_homicides.webp"},
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
  mounted() {
    const { mdAndDown } = useDisplay()
    this.mdAndDown = mdAndDown
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
    border: 1px solid #e2e8f0;
    margin: 0 auto;
    width: 80%;
    background-color: #f7fafc;
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

.title {
  font-family: 'Source Serif Pro', Roboto, serif !important;
  color: rgb(69, 69, 69);
}

.description {
  font-family: helvetica, Roboto, serif !important;
  color: rgb(110, 110, 110);
}

.example-gallery {
  font-family: 'Source Serif Pro', Roboto, serif !important;
  color: rgb(28, 28, 28);
}
</style>

