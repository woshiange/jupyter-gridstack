export const useNotebook = defineStore('notebook', {
  state: () => ({
    notebook: null,
    fileName: null,
    urlNotebook: null
  }),
  getters: {
    templateHTML(state) {
      const template = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <link rel="icon" href="https://jupyter-gridstack.pages.dev/favicon.svg" type="image/x-icon">
          <title>title</title>
          <link href="https://jupyter-gridstack.pages.dev/gridstack/gridstack.min.css" rel="stylesheet">
          <script src="https://jupyter-gridstack.pages.dev/gridstack/gridstack-all.js"></script>
          <script src="https://code.iconify.design/1/1.0.6/iconify.min.js"></script>
          <link href="https://jupyter-gridstack.pages.dev/10.0/zlatko.css" rel="stylesheet">
          <script src="https://jupyter-gridstack.pages.dev/10.0/zlatko.js" defer=""></script>
        </head>
        <body>
          <div id="loader-container">
            <div id="loader"></div>
          </div>
          <script>
            var edit=true
            var fromWebsite = true
            var fileName = '${state.fileName}'
          </script>
        </body>
        </html>
      `
      const parser = new DOMParser()
      return parser.parseFromString(template, 'text/html')
    },
    transformedNotebook(state) {
      if(!state.notebook) {
        return null
      }
      const encodedNotebook = btoa(unescape(encodeURIComponent(state.notebook)))
      const templateHTML = state.templateHTML
      const bodyElement = templateHTML.querySelector('body')
      const scriptElement = document.createElement('script')
      templateHTML.title = state.fileName
      scriptElement.id = 'scriptEncodedNotebook'
      scriptElement.textContent = `"${encodedNotebook}"`
      bodyElement.appendChild(scriptElement)
      return templateHTML.documentElement.outerHTML
    },
    notebookFromUrl(state) {
      const templateHTML = state.templateHTML
      const bodyElement = templateHTML.querySelector('body')
      const scriptElement = document.createElement('script')

      let urlNotebookCleaned
      if (state.urlNotebook.includes("github.com")) {
        urlNotebookCleaned = state.urlNotebook
            .replace("github.com", "raw.githubusercontent.com")
            .replace("/blob/", "/")
      } else {
        urlNotebookCleaned = state.urlNotebook
      }

      templateHTML.title = state.fileName
      scriptElement.textContent = `var urlNotebook = "${urlNotebookCleaned}"`
      bodyElement.appendChild(scriptElement)
      return templateHTML.documentElement.outerHTML
    }
  }
})
