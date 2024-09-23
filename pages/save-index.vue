<template>
  <v-container>
  <v-row>
    <v-col
      sm="12"
    >
      <h1 :class="(mdAndDown ? 'text-h3 mt-5' : 'text-h2 mt-15') + ' title'">
	Transform your Jupyter Notebook into a beautiful
        <span style="color: #509EE3;">dashboard.</span>
      </h1>
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <p class="description text-h5">Drag and resize notebook elements to craft a dashboard without any extra code.</p>
      <div
        class="dropzone-container d-flex mt-10 mb-10"
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
          v-if="file === null"
        />

        <label for="fileInput" class="file-label" v-if="file === null">
          <div class="d-flex justify-center">
            <div v-if="isDragging">Release to drop files here.</div>
            <div v-else>
              <div v-if="file === null">
                <u>Drop your notebook here or click to upload (ipynb or html).</u>
              </div>
            </div>
          </div>
        </label>
        <div v-else>
          <div v-if="!notebookError">
            <v-progress-circular indeterminate></v-progress-circular>
            <span>{{loaderMessage}}</span>
          </div>
          <div v-else>
            <div>{{ errorMessage !== '' ? errorMessage : 'Error' }}</div>
            <div class="d-flex justify-center">
              <v-btn class="mt-3" size="small" variant="outlined" @click="handleRetry">Retry</v-btn>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div
          v-if="!showForm"
          @click="showFormAndFocus"
          class="expansion-panel-title"
        >
          Or input your Notebook URL here.
        </div>
        <v-form ref="form" v-if="showForm" @submit.prevent="submitNotebookUrl" validate-on="submit lazy">
          <v-text-field
            ref="notebookUrlInput"
            v-model="urlNotebook"
	    :rules="rules"
	    messages='e.g.: https://github.com/woshiange/jupyter-python-notebooks/blob/main/singapore_at_a_glance.ipynb'
            label="Input your Notebook URL (ipynb or html)"
          ></v-text-field>
          <div class="d-flex justify-center">
            <v-btn class="mt-3" type="submit" size="small" variant="outlined">Submit</v-btn>
          </div>
        </v-form>
      </div>

    </v-col>
    <v-col
      cols="12"
      md="6"
      class="d-flex justify-center"
    >
      <video
        class="mt-10 elevation-6"
	width="75%"
	:style="mdAndDown ? 'max-width: 429px;' : ''"
	loop
	autoplay
	muted
	cover
      >
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
  <v-row>
    <v-col v-for="(dashboard, index) in dashboards"
      :key="index"
      cols="12"
      md="6"
      :class="'d-flex ' + (smAndDown ? 'justify-center' : (index % 2 === 0 ? 'justify-end' : 'justify-beggining'))"
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
      smAndDown: false,
      mdAndDown: false,
      isDragging: false,
      files: [],
      file: null,
      fileContent: null,
      loaderMessage: '',
      urlNotebook: '',
      showForm: false,
      errorMessage: '',
      notebookError: false,
      rules: [
        value => {
          const urlPattern = new RegExp(
            '^(https?:\\/\\/)' + // protocol (http or https)
            '((([a-zA-Z0-9$-_@.&+!*"(),]|[a-zA-Z0-9-])+)(\\:[0-9]+)?' + // domain and optional port
            '(\\/.*)?$)' // optional path
          )
          return urlPattern.test(value) || 'Must be a valid URL.'
        },
      ],
      dashboards: [
        {"title": "Bokeh", "linkUrl": "/dashboards/fuel_prices_in_france_dashboard.html", "imageUrl": "/images/fuel_prices_in_france.webp"},
        {"title": "Pyecharts", "linkUrl": "/dashboards/singapore_at_a_glance_dashboard.html", "imageUrl": "/images/singapore_at_a_glance.webp"},
        {"title": "Vega Altair", "linkUrl": "/dashboards/los_angeles_homicides_dashboard.html", "imageUrl": "/images/los_angeles_homicides.webp"},
        {"title": "Plotly", "linkUrl": "/dashboards/iowa_liquor_retail_sales_dashboard.html", "imageUrl": "/images/iowa_liquor_retail_sales.webp"},
      ]
    };
  },
  computed: {
    fileName() {
      return this.file ? this.file.name.split('.')[0] : null
    },
    fileExtension() {
      return this.file ? this.file.name.split('.').at(-1).toLowerCase() : null
    },
    ...mapStores(useNotebook)
  },
  mounted() {
    const { mdAndDown, smAndDown } = useDisplay()
    this.mdAndDown = mdAndDown
    this.smAndDown = smAndDown
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
    async convertIpynbTokHtml () {
      const formData = new FormData()
      formData.append('file', this.file)
      const response = await $fetch(
      	'https://nb-convert-711948864152.asia-southeast2.run.app/upload',
	{method: 'POST', body: formData}
      )
      this.fileContent = response
    },
    getNotebook () {
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(this.fileContent, 'text/html');
      const rootElement = htmlDocument.documentElement;
      return rootElement
    },
    showFormAndFocus() {
      // Show the form
      this.showForm = true;

      // Wait for the DOM to update before focusing on the input
      this.$nextTick(() => {
        this.$refs.notebookUrlInput.focus(); // Programmatically focus on the input
      });
    },
    async submitNotebookUrl() {
      const isValid = await this.$refs.form.validate()
      if (isValid.valid) {
        this.notebookStore.urlNotebook = this.urlNotebook
        this.notebookStore.fileName = 'serbe'
        this.$router.push({ name: 'edit' })
      }
    },
    isValidNotebook(notebookStr) {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(notebookStr, 'text/html');

        const isNotebook = doc.querySelector('.jp-Notebook') ||
                           doc.querySelector('.jp-InputArea') ||
                           doc.querySelector('.jp-Cell')

        return !!isNotebook;
      } catch (error) {
        return false
      }
    },
    handleRetry() {
      this.notebookStore.notebook = null
      this.notebookStore.fileName = null
      this.files = []
      this.file = null
      this.fileContent = null
      this.loaderMessage = ''
      this.urlNotebook = ''
      this.showForm = false
      this.errorMessage = ''
      this.notebookError = false
    },
  },
  watch: {
    file() {
      if(!this.file) {
        return
      }
      if(this.fileExtension === 'ipynb') {
        this.loaderMessage = 'Converting Ipynb to Html...'
	this.convertIpynbTokHtml()
      } else {
        const reader = new FileReader()
        reader.onload = () => {
          this.loaderMessage = '   Loading...'
          this.fileContent = reader.result
        }
        reader.readAsText(this.file)
      }
    },
    fileContent() {
      const notebook = this.getNotebook().outerHTML
      if (this.isValidNotebook(notebook)) {
        this.notebookStore.notebook = notebook
        this.notebookStore.fileName = this.fileName
        this.$router.push({ name: 'edit' })
      } else {
        if(!this.file) {
	  this.errorMessage = ''
	  return
	}
        this.errorMessage = `Error: ${this.file.name} is not a valid Jupyter notebook.`
        this.notebookError = true
      }
    },
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

.expansion-panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  cursor: pointer;
  font-family: helvetica, Roboto, serif !important;
  color: rgb(110, 110, 110);
  transition: background-color 0.3s ease;
}

.expansion-panel-title:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

</style>

