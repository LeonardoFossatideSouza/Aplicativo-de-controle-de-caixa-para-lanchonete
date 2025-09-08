/**
 * renderer.js
 * Versão final e estável.
 * Controla toda a interatividade da página principal (index.html).
 */

const URL_DA_API = 'http://localhost:8080/api_lanches/';

// --- "PORTEIRO": Verificação de Login ---
// Este bloco garante que apenas usuários logados acessem esta página.
const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

// --- VARIÁVEIS DE ESTADO GLOBAIS ---
let pedidoAbertoId = null;
let pedidoAbertoTotal = 0;

// ===================================================================
//              DEFINIÇÃO DE TODAS AS FUNÇÕES
// ===================================================================

/**
 * Solicita o valor inicial do caixa ao usuário usando a janela de diálogo customizada.
 */
async function solicitarCaixaInicial() {
    if (!sessionStorage.getItem('caixaInicial')) {
        let caixaInicial = await window.api.abrirPrompt("Por favor, digite o valor inicial do caixa:", "0.00");
        while (caixaInicial !== null && (isNaN(parseFloat(caixaInicial)) || parseFloat(caixaInicial) < 0)) {
            alert("Valor inválido. Por favor, digite apenas números positivos.");
            caixaInicial = await window.api.abrirPrompt("Por favor, digite o valor inicial do caixa:", "0.00");
        }
        if (caixaInicial !== null) {
            sessionStorage.setItem('caixaInicial', parseFloat(caixaInicial).toFixed(2));
        }
    }
}

/**
 * Busca na API todos os pedidos com status ativos e os exibe na tabela principal.
 */
async function carregarPedidosAbertos() {
    try {
        const response = await fetch(URL_DA_API + 'get_pedidos_abertos.php');
        if (!response.ok) throw new Error('Falha na rede ou erro no servidor');
        const pedidos = await response.json();
        const tabelaPedidosBody = document.querySelector('#corpo-tabela-pedidos');
        tabelaPedidosBody.innerHTML = '';
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${pedido.id}</td>
                <td>${pedido.nome_cliente}</td>
                <td>R$ ${parseFloat(pedido.valor_total).toFixed(2)}</td>
                <td>${pedido.hora}</td>
                <td><strong>${pedido.status.toUpperCase()}</strong></td>
            `;
            tr.style.cursor = 'pointer';
            tr.dataset.pedidoId = pedido.id;
            tr.dataset.pedidoStatus = pedido.status;
            tr.dataset.valorTotal = pedido.valor_total;
            tabelaPedidosBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
        document.querySelector('#corpo-tabela-pedidos').innerHTML = `<tr><td colspan="5">Erro ao carregar pedidos. Verifique o XAMPP e a API.</td></tr>`;
    }
}

/**
 * Abre o modal com os detalhes de um pedido e controla a visibilidade dos botões.
 */
async function abrirModal(pedidoId, status, total) {
    pedidoAbertoId = pedidoId;
    pedidoAbertoTotal = parseFloat(total);
    
    // Reseta o modal para o estado inicial toda vez que é aberto
    document.getElementById('secao-pagamento').style.display = 'none';
    document.getElementById('botoes-acao-modal').style.display = 'block';
    document.getElementById('modal-btn-confirmar-pagamento').style.display = 'none';
    document.getElementById('campo-troco').style.display = 'none';
    document.getElementById('valor-pago').value = '';
    document.getElementById('valor-desconto').value = ''; // Limpa o campo de desconto
    const radioSelecionado = document.querySelector('input[name="forma_pagamento"]:checked');
    if (radioSelecionado) radioSelecionado.checked = false;

    // Mostra/esconde os botões de acordo com o status do pedido
    document.getElementById('modal-btn-preparo').style.display = (status === 'recebido') ? 'inline-block' : 'none';
    document.getElementById('modal-btn-entregue').style.display = (status === 'em preparo') ? 'inline-block' : 'none';
    document.getElementById('modal-btn-finalizar').style.display = (status === 'entregue') ? 'inline-block' : 'none';
    document.getElementById('modal-btn-add').style.display = 'inline-block';

    const response = await fetch(`${URL_DA_API}get_pedido_detalhes.php?id=${pedidoId}`);
    const data = await response.json();
    if (data.sucesso) {
        document.getElementById('modal-titulo').textContent = `Detalhes do Pedido Nº ${pedidoId}`;
        const modalListaItens = document.getElementById('modal-lista-itens');
        modalListaItens.innerHTML = '';
        let totalCalculado = 0;
        data.itens.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.quantidade}x ${item.nome} - R$ ${(item.quantidade * item.preco_unitario).toFixed(2)}`;
            modalListaItens.appendChild(li);
            totalCalculado += item.quantidade * item.preco_unitario;
        });
        document.getElementById('modal-total').textContent = `Total Bruto: R$ ${totalCalculado.toFixed(2)}`;
        document.getElementById('pedido-modal').style.display = 'block';
    }
}

/**
 * Prepara o modal para a etapa de pagamento.
 */
function iniciarPagamento() {
    document.getElementById('secao-pagamento').style.display = 'block';
    document.getElementById('botoes-acao-modal').style.display = 'none';
    document.getElementById('modal-btn-confirmar-pagamento').style.display = 'inline-block';
    recalcularTotais(); // Calcula e exibe o total inicial a pagar
}

/**
 * Recalcula o total com desconto e o troco.
 */
function recalcularTotais() {
    const valorDescontoInput = document.getElementById('valor-desconto');
    const modalTotalFinalEl = document.getElementById('modal-total-final');
    const valorPagoInput = document.getElementById('valor-pago');
    const valorTrocoEl = document.getElementById('valor-troco');

    const desconto = parseFloat(valorDescontoInput.value) || 0;
    const totalAPagar = pedidoAbertoTotal - desconto;
    
    modalTotalFinalEl.textContent = `Total a Pagar: R$ ${totalAPagar.toFixed(2)}`;

    const valorPago = parseFloat(valorPagoInput.value) || 0;
    const troco = valorPago - totalAPagar;
    valorTrocoEl.textContent = (troco >= 0) ? troco.toFixed(2) : '0.00';
}

/**
 * Função genérica para chamar a API e atualizar o status de um pedido.
 */
async function atualizarStatus(novoStatus, dadosExtras = {}) {
    const corpoRequisicao = { id: pedidoAbertoId, status: novoStatus, ...dadosExtras };
    const response = await fetch(URL_DA_API + 'atualizar_status_pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpoRequisicao)
    });
    const resultado = await response.json();
    if (resultado.sucesso) {
        document.getElementById('pedido-modal').style.display = 'none';
        carregarPedidosAbertos();
    } else {
        alert('Erro: ' + resultado.erro);
    }
}

/**
 * Valida e confirma o pagamento do pedido, incluindo o desconto.
 */
function confirmarPagamento() {
    const formaPagamentoSelecionada = document.querySelector('input[name="forma_pagamento"]:checked');
    if (!formaPagamentoSelecionada) {
        alert('Por favor, selecione uma forma de pagamento.');
        return;
    }

    const desconto = parseFloat(document.getElementById('valor-desconto').value) || 0;
    if (desconto < 0 || desconto > pedidoAbertoTotal) {
        alert('O valor do desconto é inválido.');
        return;
    }

    const formaPagamento = formaPagamentoSelecionada.value;
    if (formaPagamento === 'Dinheiro') {
        const valorPago = parseFloat(document.getElementById('valor-pago').value) || 0;
        const totalAPagar = pedidoAbertoTotal - desconto;
        if (valorPago < totalAPagar) {
            alert('O valor pago não pode ser menor que o total a pagar.');
            return;
        }
    }
    
    if (confirm('Confirmar o pagamento deste pedido?')) {
        atualizarStatus('pago', { 
            forma_pagamento: formaPagamento,
            desconto: desconto 
        });
    }
}

/**
 * Inicia o processo de fechamento de caixa do dia.
 */
async function fecharCaixa() {
    if (!confirm('Você tem certeza que deseja fechar o caixa do dia?')) return;
    if (!confirm('Esta ação arquivará todos os pedidos pagos e não pode ser desfeita. Continuar?')) return;

    try {
        const caixaInicial = parseFloat(sessionStorage.getItem('caixaInicial') || '0');
        const nomeUsuario = usuarioLogado ? usuarioLogado.nome : 'Desconhecido';

        const response = await fetch(URL_DA_API + 'fechar_caixa.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caixa_inicial: caixaInicial,
                nome_usuario: nomeUsuario
            })
        });

        const resultado = await response.json();
        if (resultado.sucesso) {
            // Monta uma mensagem de alerta mais detalhada
            const totalBruto = parseFloat(resultado.total_bruto).toFixed(2);
            const totalDescontos = parseFloat(resultado.total_descontos).toFixed(2);
            const totalLiquido = parseFloat(resultado.total_liquido).toFixed(2);

            const mensagem = `Caixa fechado com sucesso!
----------------------------------
Total Bruto Vendido: R$ ${totalBruto}
Total de Descontos: R$ ${totalDescontos}
----------------------------------
Total Líquido Apurado: R$ ${totalLiquido}
            `;
            alert(mensagem);
            
            // A lógica de impressão continua a mesma
            if (resultado.detalhes.length > 0 || caixaInicial > 0) {
                window.api.imprimirRelatorio(resultado);
            }

            sessionStorage.clear();
            window.location.href = 'login.html';
        } else {
            alert('Erro ao fechar o caixa: ' + resultado.erro);
        }
    } catch (error) {
        console.error("Erro ao fechar o caixa:", error);
        alert("Ocorreu um erro de comunicação com a API.");
    }
}

// ===================================================================
//              PONTO DE ENTRADA PRINCIPAL DO SCRIPT
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
    // --- MAPEAMENTO DOS ELEMENTOS (feito de forma segura) ---
    const tabelaPedidosBody = document.querySelector('#corpo-tabela-pedidos');
    const modal = document.getElementById('pedido-modal');
    // ... (repetição das constantes para garantir escopo, mas o ideal é declarar uma vez só)
    const spanClose = document.querySelector('.close');
    const modalBtnPreparo = document.getElementById('modal-btn-preparo');
    const modalBtnEntregue = document.getElementById('modal-btn-entregue');
    const modalBtnFinalizar = document.getElementById('modal-btn-finalizar');
    const valorPagoInput = document.getElementById('valor-pago');
    const valorDescontoInput = document.getElementById('valor-desconto');
    const opcoesPagamento = document.getElementById('opcoes-pagamento');
    const modalBtnConfirmarPagamento = document.getElementById('modal-btn-confirmar-pagamento');
    const modalBtnAdd = document.getElementById('modal-btn-add');
    const btnFecharCaixa = document.getElementById('btn-fechar-caixa');
    const linkFuncionarios = document.getElementById('link-funcionarios');
    const linkDashboard = document.querySelector('a[href="dashboard.html"]');

    // --- LÓGICA DE PERMISSÕES ---
    if (usuarioLogado.cargo !== 'administrador') {
        if (linkFuncionarios) linkFuncionarios.style.display = 'none';
        if (linkDashboard) linkDashboard.style.display = 'none';
    }

    // --- CONFIGURAÇÃO DOS EVENTOS (LISTENERS) ---
    tabelaPedidosBody.addEventListener('click', (event) => {
        const tr = event.target.closest('tr');
        if (tr && tr.dataset.pedidoId) {
            abrirModal(tr.dataset.pedidoId, tr.dataset.pedidoStatus, tr.dataset.valorTotal); 
        }
    });

    modalBtnPreparo.addEventListener('click', () => atualizarStatus('em preparo'));
    modalBtnEntregue.addEventListener('click', () => atualizarStatus('entregue'));
    modalBtnFinalizar.addEventListener('click', iniciarPagamento);
    valorPagoInput.addEventListener('input', recalcularTotais);
    valorDescontoInput.addEventListener('input', recalcularTotais); // Listener para o desconto
    opcoesPagamento.addEventListener('change', (event) => {
        document.getElementById('campo-troco').style.display = (event.target.value === 'Dinheiro') ? 'block' : 'none';
    });
    modalBtnConfirmarPagamento.addEventListener('click', confirmarPagamento);
    modalBtnAdd.addEventListener('click', () => {
        if (pedidoAbertoId) window.location.href = `novo_pedido.html?pedido_id=${pedidoAbertoId}`;
    });
    btnFecharCaixa.addEventListener('click', fecharCaixa);
    spanClose.onclick = () => { modal.style.display = 'none'; };
    window.onclick = (event) => { if (event.target == modal) { modal.style.display = 'none'; } };
    window.addEventListener('focus', carregarPedidosAbertos);

    // --- INICIALIZAÇÃO ---
    carregarPedidosAbertos();
    solicitarCaixaInicial();
});