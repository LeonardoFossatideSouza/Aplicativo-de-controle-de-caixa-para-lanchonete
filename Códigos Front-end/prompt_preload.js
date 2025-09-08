const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Ouve quando o main.js envia os detalhes da pergunta
  onShowPrompt: (callback) => ipcRenderer.on('show-prompt', (event, ...args) => callback(...args)),
  // Envia a resposta do usuário de volta para o main.js
  promptResponse: (value) => ipcRenderer.send('prompt-response', value)
});