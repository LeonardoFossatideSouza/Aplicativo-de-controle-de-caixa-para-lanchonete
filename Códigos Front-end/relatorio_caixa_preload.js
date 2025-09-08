const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onPreencherRelatorio: (callback) => ipcRenderer.on('preencher-relatorio', (event, ...args) => callback(...args)),
  relatorioPronto: () => ipcRenderer.send('relatorio-pronto-para-imprimir')
});