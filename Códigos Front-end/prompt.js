const labelPergunta = document.getElementById('label-pergunta');
const valorInput = document.getElementById('valor-input');
const okBtn = document.getElementById('ok-btn');

// Ouve as instruções do main.js para configurar a caixa
window.electronAPI.onShowPrompt((pergunta, valorDefault) => {
    labelPergunta.textContent = pergunta;
    valorInput.value = valorDefault;
    valorInput.focus();
});

// Envia a resposta quando o botão OK é clicado
okBtn.addEventListener('click', () => {
    window.electronAPI.promptResponse(valorInput.value);
});

// Permite enviar a resposta com a tecla Enter
valorInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        okBtn.click();
    }
});