export const useNotebook = defineStore('notebook', {
  state: () => ({
    notebook: null,
    fileName: null
  }),
  getters: {
    templateHTML(state) {
      const template = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Title Here</title>
          <link href="https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css" rel="stylesheet">
          <script src="https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js"></script>
          <script src="https://code.iconify.design/1/1.0.6/iconify.min.js"></script>
          <link href="http://localhost:3000/jupyter-gridstack/2.0/zlatko.css" rel="stylesheet">
          <script src="http://localhost:3000/jupyter-gridstack/2.0/zlatko.js" defer=""></script>
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
      const encodedNotebook = btoa(unescape(encodeURIComponent(state.notebook)))
      const templateHTML = state.templateHTML
      const bodyElement = templateHTML.querySelector('body')
      const scriptElement = document.createElement('script')
      scriptElement.id = 'scriptEncodedNotebook'
      scriptElement.textContent = `"${encodedNotebook}"`
      bodyElement.appendChild(scriptElement)
      return templateHTML.documentElement.outerHTML
    },
    urlNotebook(state) {
      const templateHTML = state.templateHTML
      const bodyElement = templateHTML.querySelector('body')
      const scriptElement = document.createElement('script')
      scriptElement.textContent = `var urlNotebook = "https://woshiange.github.io/jupyter-gridstack/python/los_angeles_homicides.html"`
      bodyElement.appendChild(scriptElement)
      return templateHTML.documentElement.outerHTML
    },
  }
})
