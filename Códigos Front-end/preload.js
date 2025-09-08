const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Funções de impressão
  imprimirComanda: (dados) => ipcRenderer.send('imprimir-comanda', dados),
  imprimirRelatorio: (dados) => ipcRenderer.send('imprimir-relatorio', dados),
  imprimirRelatorioVendas: (dados) => ipcRenderer.send('imprimir-relatorio-vendas', dados),
  // Função para o prompt customizado
  abrirPrompt: (pergunta, valorDefault) => ipcRenderer.invoke('open-prompt', pergunta, valorDefault)
});