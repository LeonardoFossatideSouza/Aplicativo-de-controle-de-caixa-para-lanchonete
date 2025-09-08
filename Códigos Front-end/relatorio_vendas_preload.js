const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electron', {
  onPreencherRelatorio: (callback) => ipcRenderer.on('preencher-relatorio-vendas', (event, ...args) => callback(...args)),
  relatorioPronto: () => ipcRenderer.send('relatorio-vendas-pronto')
});