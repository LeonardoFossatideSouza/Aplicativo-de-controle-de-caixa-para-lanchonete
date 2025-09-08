// "Porteiro": Verifica se há um usuário logado.
const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

const URL_DA_API = 'http://localhost:8080/api_lanches/';

// Mapeamento dos elementos do DOM
const tabelaPedidosBody = document.querySelector('#corpo-tabela-pedidos');
const modal = document.getElementById('pedido-modal');
const spanClose = document.querySelector('.close');
const btnGerarRelatorio = document.getElementById('btn-gerar-relatorio');
const filtroPeriodo = document.getElementById('filtro-periodo');

/**
 * Carrega a lista de pedidos finalizados da API e preenche a tabela.
 */
async function carregarPedidosFinalizados() {
    try {
        const response = await fetch(URL_DA_API + 'get_pedidos_finalizados.php');
        const pedidos = await response.json();
        tabelaPedidosBody.innerHTML = '';
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            // Garante que os valores sejam numéricos
            const valorTotal = parseFloat(pedido.valor_total) || 0;
            const desconto = parseFloat(pedido.desconto) || 0;
            const totalPago = valorTotal - desconto;

            tr.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.data}</td>
                <td>${pedido.hora}</td>
                <td>${pedido.nome_cliente}</td>
                <td>R$ ${valorTotal.toFixed(2)}</td>
                <td>R$ ${desconto.toFixed(2)}</td>
                <td><strong>R$ ${totalPago.toFixed(2)}</strong></td>
                <td>${pedido.forma_pagamento || 'N/A'}</td>
            `;
            // Armazena todos os dados necessários no dataset da linha
            tr.dataset.pedidoId = pedido.id;
            tr.dataset.valorTotal = pedido.valor_total;
            tr.dataset.desconto = pedido.desconto; // Armazena o desconto
            tr.dataset.formaPagamento = pedido.forma_pagamento || 'N/A';
            tabelaPedidosBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
    }
}

/**
 * Abre o modal com os detalhes de um pedido específico.
 */
async function abrirModalDetalhes(pedidoId, valorTotal, formaPagamento, desconto) {
    const response = await fetch(`${URL_DA_API}get_pedido_detalhes.php?id=${pedidoId}`);
    const data = await response.json();
    
    if (data.sucesso) {
        document.getElementById('modal-titulo').textContent = `Detalhes do Pedido Nº ${pedidoId}`;
        const listaItens = document.getElementById('modal-lista-itens');
        listaItens.innerHTML = '';
        data.itens.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.quantidade}x ${item.nome}`;
            listaItens.appendChild(li);
        });

        // Lógica de cálculo mais segura para evitar NaN
        const subtotal = parseFloat(valorTotal) || 0;
        const valorDesconto = parseFloat(desconto) || 0;
        const totalPago = subtotal - valorDesconto;

        // Preenche os campos de valores no modal
        document.getElementById('modal-subtotal').textContent = `Subtotal: R$ ${subtotal.toFixed(2)}`;
        document.getElementById('modal-desconto').textContent = `Desconto: - R$ ${valorDesconto.toFixed(2)}`;
        document.getElementById('modal-total-pago').textContent = `Total Pago: R$ ${totalPago.toFixed(2)}`;
        document.getElementById('modal-pagamento').textContent = `Forma de Pagamento: ${formaPagamento}`;
        
        modal.style.display = 'block';
    }
}

/**
 * Gera e dispara a impressão do relatório de mais vendidos.
 */
async function gerarRelatorioMaisVendidos() {
    const periodo = filtroPeriodo.value;
    const response = await fetch(`${URL_DA_API}get_relatorio_mais_vendidos.php?periodo=${periodo}`);
    const resultado = await response.json();
    if(resultado.sucesso) {
        if(resultado.relatorio.length > 0) {
            window.api.imprimirRelatorioVendas(resultado);
        } else {
            alert(`Nenhum produto vendido no período selecionado (${periodo}).`);
        }
    } else {
        alert('Erro ao gerar relatório: ' + resultado.erro);
    }
}

// --- Event Listeners ---

// Ouve cliques na tabela para abrir o modal
tabelaPedidosBody.addEventListener('click', (event) => {
    const tr = event.target.closest('tr');
    if (tr && tr.dataset.pedidoId) {
        // Passa todos os dados, incluindo o desconto, para a função do modal
        abrirModalDetalhes(tr.dataset.pedidoId, tr.dataset.valorTotal, tr.dataset.formaPagamento, tr.dataset.desconto);
    }
});

// Ouve o clique no botão para gerar o relatório
btnGerarRelatorio.addEventListener('click', gerarRelatorioMaisVendidos);

// Ouve os cliques para fechar o modal
spanClose.onclick = () => { modal.style.display = 'none'; };
window.onclick = (event) => { if (event.target == modal) { modal.style.display = 'none'; } };

// --- Inicialização ---
carregarPedidosFinalizados();