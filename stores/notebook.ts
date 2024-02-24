export const useNotebook = defineStore('notebook', {
  state: () => ({
    notebook: null,
    fileName: null
  }),
  getters: {
    transformedNotebook(state) {
      const encodedNotebook = btoa(unescape(encodeURIComponent(state.notebook)))
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
	<link href="http://localhost:3000/2.0/zlatko.css" rel="stylesheet">
	<script src="http://localhost:3000/2.0/zlatko.js" defer=""></script>
      </head>
      <body>
        <script id="scriptEncodedNotebook">
          "${encodedNotebook}"
        </script>
        <script>
	  var edit=true
	  var fromWebsite = true
          var fileName = '${state.fileName}'
        </script>
      </body>
      </html>
      `
      return template
    },
    urlNotebook(state) {
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
	<link href="http://localhost:3000/2.0/zlatko.css" rel="stylesheet">
	<script src="http://localhost:3000/2.0/zlatko.js" defer=""></script>
      </head>
      <body>
        <script>
	  var urlNotebook = "http://localhost:3000/liquor.html"
	  var edit=true
	  var fromWebsite = true
          var fileName = '${state.fileName}'
        </script>
      </body>
      </html>
      `
      return template
    },
  }
})
