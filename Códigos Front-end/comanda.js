window.electron.onPreencherComanda((dados) => {
    console.log('[comanda.js] A. Dados recebidos para preencher a comanda:', dados);
    try {
        document.getElementById('data').textContent = new Date().toLocaleString('pt-BR');
        document.getElementById('pedido-id').textContent = dados.pedido_id;
        document.getElementById('valor-total').textContent = parseFloat(dados.valor_total).toFixed(2);
        
        const listaItens = document.getElementById('lista-itens');
        listaItens.innerHTML = ''; 
        
        dados.itens.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.quantidade}x</td>
                <td>${item.nome}</td>
                <td>${(item.quantidade * item.preco).toFixed(2)}</td>
            `;
            listaItens.appendChild(tr);
        });

        console.log('[comanda.js] B. HTML preenchido. Enviando sinal "comanda-pronta" de volta para o main.js...');
        window.electron.comandaPronta();
    } catch (error) {
        console.error('[comanda.js] C. ERRO ao preencher o HTML da comanda:', error);
    }
});