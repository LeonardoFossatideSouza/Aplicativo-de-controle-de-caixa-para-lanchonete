/**
 * main.js
 * Versão final e estável.
 * Gerencia a janela principal, a impressão e as caixas de diálogo customizadas.
 */

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');

// Mude para 'false' para que a janela de impressão sempre apareça (Modo de Teste).
const MODO_IMPRESSAO_SILENCIOSA = false;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {

  // --- OUVINTE PARA A CAIXA DE DIÁLOGO CUSTOMIZADA (PROMPT) ---
  ipcMain.handle('open-prompt', async (event, pergunta, valorDefault) => {
    return new Promise(resolve => {
        const promptWindow = new BrowserWindow({
            width: 400,
            height: 200,
            show: true,
            modal: true,
            parent: BrowserWindow.getFocusedWindow(),
            webPreferences: {
                preload: path.join(__dirname, 'prompt_preload.js'),
                nodeIntegration: false,
                contextIsolation: true
            },
            resizable: false,
            maximizable: false,
            minimizable: false,
        });
        
        promptWindow.loadFile('prompt.html');
        
        promptWindow.webContents.on('did-finish-load', () => {
            promptWindow.webContents.send('show-prompt', pergunta, valorDefault);
        });

        ipcMain.once('prompt-response', (event, value) => {
            resolve(value);
            if (!promptWindow.isDestroyed()) promptWindow.close();
        });
    });
  });

  // --- OUVINTES DE IMPRESSÃO ---
  
  // ===================================================================
  //                       1ª ALTERAÇÃO MÍNIMA
  // Adicionamos 'copies = 1' como último parâmetro da função.
  // ===================================================================
  const handlePrint = (event, data, htmlFile, preloadFile, readyEvent, preencherEvent, copies = 1) => {
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: { preload: path.join(__dirname, preloadFile) }
    });
    printWindow.loadFile(htmlFile);

    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.send(preencherEvent, data);
    });

    ipcMain.once(readyEvent, () => {
      // ===================================================================
      //                       2ª ALTERAÇÃO MÍNIMA
      // Usamos a variável 'copies' dentro das opções de impressão.
      // ===================================================================
      printWindow.webContents.print({ silent: MODO_IMPRESSAO_SILENCIOSA, copies: copies }, (success, errorType) => {
        if (!success) {
          console.log(`Impressão falhou ou foi cancelada. Erro: ${errorType}`);
        }
        if (!printWindow.isDestroyed()) {
          printWindow.close();
        }
      });
    });
  };

  // Ouvintes de impressão agora usam a função genérica
  // ===================================================================
  //                       3ª ALTERAÇÃO MÍNIMA
  // Passamos o número 2 como o último argumento para a comanda.
  // ===================================================================
  ipcMain.on('imprimir-comanda', (event, data) => handlePrint(event, data, 'comanda.html', 'comanda_preload.js', 'comanda-pronta-para-imprimir', 'preencher-comanda', 2));
  
  // Os outros relatórios continuam como estavam, usando o valor padrão de 1 cópia.
  ipcMain.on('imprimir-relatorio', (event, data) => handlePrint(event, data, 'relatorio_caixa.html', 'relatorio_caixa_preload.js', 'relatorio-pronto-para-imprimir', 'preencher-relatorio'));
  ipcMain.on('imprimir-relatorio-vendas', (event, data) => handlePrint(event, data, 'relatorio_vendas.html', 'relatorio_vendas_preload.js', 'relatorio-vendas-pronto', 'preencher-relatorio-vendas'));

  // A criação da janela deve acontecer DEPOIS da definição de todos os ouvintes.
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});