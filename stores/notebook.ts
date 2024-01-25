export const useNotebook = defineStore('notebook', {
  state: () => ({
    notebook: null,
    fileName: null
  }),
  getters: {
    transformedNotebook(state) {
      const parser = new DOMParser()
      const htmlDocument = parser.parseFromString(state.notebook, 'text/html');
      const rootElement = htmlDocument.documentElement;
      const link = document.createElement('link');
      link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
      link.rel = 'stylesheet'
      const script = document.createElement('script')
      script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
      const scriptSelf = document.createElement('script')
      scriptSelf.src = 'https://jupyter-gridstack.pages.dev/1.0/zlatko.js'
      scriptSelf.defer = true
      const scriptIconify = document.createElement('script')
      scriptIconify.src = 'https://code.iconify.design/1/1.0.6/iconify.min.js'
      const referenceNode = rootElement.querySelector('meta[name="viewport"]')
      referenceNode.parentNode.insertBefore(scriptIconify, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(scriptSelf, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
      const scriptEdit= document.createElement('script')
      scriptEdit.textContent = "var edit = true"
      var bodyElement = rootElement.getElementsByTagName('body')[0]
      bodyElement.insertBefore(scriptEdit, bodyElement.firstChild)
      const scriptFromWebsite= document.createElement('script')
      scriptFromWebsite.textContent = "var fromWebsite = true"
      bodyElement.insertBefore(scriptFromWebsite, bodyElement.firstChild)
      const scriptFileName= document.createElement('script')
      scriptFileName.textContent = `var fileName = '${state.fileName}'`
      bodyElement.insertBefore(scriptFileName, bodyElement.firstChild)
      const scripts = htmlDocument.getElementsByTagName('script')
      for (const currentScript of scripts) {
        const scriptContent = currentScript.textContent
	if (scriptContent.includes('require.config')) {
	  if (!scriptContent.includes('waitSeconds')) {
            const modifiedScriptContent = scriptContent.replace(
		    /require\.config\({/,
		    'require.config({\n    waitSeconds: 30,'
	    )
	    currentScript.textContent = modifiedScriptContent
	  }
	}
      }
      return rootElement.outerHTML
    },
  }
})
