window.electron.onPreencherRelatorio((dados) => {
    try {
        const caixaInicial = parseFloat(dados.caixa_inicial) || 0;
        const totalBruto = parseFloat(dados.total_bruto) || 0;
        const totalDescontos = parseFloat(dados.total_descontos) || 0;
        const totalLiquido = parseFloat(dados.total_liquido) || 0;

        document.getElementById('data-fechamento').textContent = new Date().toLocaleDateString('pt-BR');
        document.getElementById('nome-usuario').textContent = dados.nome_usuario;
        document.getElementById('caixa-inicial').textContent = `R$ ${caixaInicial.toFixed(2)}`;

        const detalhesDiv = document.getElementById('detalhes-pagamentos');
        detalhesDiv.innerHTML = '<strong>ENTRADAS:</strong>';
        dados.detalhes.forEach(detalhe => {
            const linha = document.createElement('div');
            linha.className = 'linha-total';
            linha.innerHTML = `<span>(+) ${detalhe.forma_pagamento.toUpperCase()}</span><span>R$ ${parseFloat(detalhe.total_por_forma).toFixed(2)}</span>`;
            detalhesDiv.appendChild(linha);
        });

        document.getElementById('valor-total-bruto').textContent = `R$ ${totalBruto.toFixed(2)}`;
        document.getElementById('valor-total-descontos').textContent = `R$ ${totalDescontos.toFixed(2)}`;
        document.getElementById('valor-total-liquido').textContent = `R$ ${totalLiquido.toFixed(2)}`;
        
        const totalEmCaixa = caixaInicial + totalLiquido;
        document.getElementById('valor-total-caixa').textContent = `R$ ${totalEmCaixa.toFixed(2)}`;

        window.electron.relatorioPronto();
    } catch (error) {
        console.error("Erro ao preencher o relatório HTML:", error);
    }
});