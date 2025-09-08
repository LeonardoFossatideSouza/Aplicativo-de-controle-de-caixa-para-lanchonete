const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // Ouve o evento 'preencher-comanda' vindo do main.js e passa para o comanda.js
    onPreencherComanda: (callback) => ipcRenderer.on('preencher-comanda', (event, ...args) => callback(...args)),
    // Envia um sinal de volta para o main.js
    comandaPronta: () => ipcRenderer.send('comanda-pronta-para-imprimir')
});