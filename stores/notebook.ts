export const useNotebook = defineStore('notebook', {
  state: () => ({
    notebook: null,
    transformedNotebookFromEdit: null
  }),
  getters: {
    transformedNotebook(state) {
      if(state.transformedNotebookFromEdit) {
        return state.transformedNotebookFromEdit
      }
      const parser = new DOMParser()
      const htmlDocument = parser.parseFromString(state.notebook, 'text/html');
      const rootElement = htmlDocument.documentElement;
      const link = document.createElement('link');
      link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
      link.rel = 'stylesheet'
      const script = document.createElement('script')
      script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
      const scriptSelf = document.createElement('script')
      scriptSelf.src = 'http://0.0.0.0:8000/zlatko.js'
      scriptSelf.defer = true
      const referenceNode = rootElement.querySelector('meta[name="viewport"]')
      referenceNode.parentNode.insertBefore(scriptSelf, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
      const scriptEdit= document.createElement('script')
      scriptEdit.textContent = "var edit = true"
      var bodyElement = rootElement.getElementsByTagName('body')[0]
      bodyElement.insertBefore(scriptEdit, bodyElement.firstChild)
      return rootElement.outerHTML
    },
    trashNotebook(state) {
      if(state.transformedNotebookFromEdit) {
        return state.transformedNotebookFromEdit
      }
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(state.notebook, 'text/html');
      const rootElement = htmlDocument.documentElement;
      const link = document.createElement('link');
      link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
      link.rel = 'stylesheet'
      const script = document.createElement('script')
      script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
      const scriptSelf = document.createElement('script')
      scriptSelf.src = 'http://0.0.0.0:8000/zlatko.js'
      scriptSelf.defer = true
      const referenceNode = rootElement.querySelector('meta[name="viewport"]')
      referenceNode.parentNode.insertBefore(scriptSelf, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
      referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
      const scriptTrash = document.createElement('script')
      scriptTrash.textContent = "var trashMark = true"
      var bodyElement = rootElement.getElementsByTagName('body')[0]
      bodyElement.insertBefore(scriptTrash, bodyElement.firstChild)
      return rootElement.outerHTML
    },
    downloadNotebook(state) {
      return function (savedData) {
        const parser = new DOMParser()
        const htmlDocument = parser.parseFromString(state.notebook, 'text/html');
        const rootElement = htmlDocument.documentElement;
        const link = document.createElement('link');
        link.href = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack.min.css'
        link.rel = 'stylesheet'
        const script = document.createElement('script')
        script.src = 'https://gridstackjs.com/node_modules/gridstack/dist/gridstack-all.js'
        const scriptSelf = document.createElement('script')
        scriptSelf.src = 'http://0.0.0.0:8000/zlatko.js'
        scriptSelf.defer = true
        const referenceNode = rootElement.querySelector('meta[name="viewport"]')
        referenceNode.parentNode.insertBefore(scriptSelf, referenceNode.nextSibling)
        referenceNode.parentNode.insertBefore(script, referenceNode.nextSibling)
        referenceNode.parentNode.insertBefore(link, referenceNode.nextSibling)
        const scriptSavedData = document.createElement('script')
        scriptSavedData.textContent = "var savedData = " + JSON.stringify(savedData)
        var bodyElement = rootElement.getElementsByTagName('body')[0]
        bodyElement.insertBefore(scriptSavedData, bodyElement.firstChild)
        const scriptEdit= document.createElement('script')
        scriptEdit.textContent = "var edit = false"
        var bodyElement = rootElement.getElementsByTagName('body')[0]
        bodyElement.insertBefore(scriptEdit, bodyElement.firstChild)
        return rootElement
      }
    }
  }
})
