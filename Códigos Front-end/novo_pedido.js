/**
 * novo_pedido.js
 * Controla a lógica da página de criação e edição de pedidos.
 */

// Constante que define o endereço base da nossa API
const URL_DA_API = 'http://localhost:8080/api_lanches/';

// --- VARIÁVEIS GLOBAIS ---
// Guarda a lista de todos os produtos disponíveis
let cardapio = [];
// Guarda a lista de itens do pedido que está sendo montado na tela
let pedidoAtual = [];
// Guarda o ID do pedido se estivermos no modo de edição
let idPedidoEdicao = null;

// --- MAPEAMENTO DOS ELEMENTOS DO HTML (DOM) ---
const tituloPaginaEl = document.getElementById('titulo-pagina');
const listaProdutosEl = document.getElementById('lista-produtos');
const listaItensPedidoEl = document.getElementById('lista-itens-pedido');
const valorTotalEl = document.getElementById('valor-total');
const salvarPedidoBtn = document.getElementById('salvar-pedido');

// --- FUNÇÕES ---

/**
 * Função principal que é executada assim que a página carrega.
 * Ela organiza todo o processo de inicialização.
 */
async function iniciarPagina() {
    await carregarCardapio();

    // Analisa a URL da página para ver se um ID de pedido foi passado (ex: ...?pedido_id=123)
    const params = new URLSearchParams(window.location.search);
    const pedidoId = params.get('pedido_id');

    if (pedidoId) {
        // MODO DE EDIÇÃO: Se encontrou um ID, carrega os dados desse pedido
        idPedidoEdicao = pedidoId;
        tituloPaginaEl.textContent = `Adicionando ao Pedido Nº ${idPedidoEdicao}`;
        await carregarPedidoExistente(idPedidoEdicao);
    } else {
        // MODO DE CRIAÇÃO: Se não, apenas prepara para um novo pedido
        tituloPaginaEl.textContent = 'Novo Pedido';
    }
}

/**
 * Busca os dados de um pedido que já existe na API (usado no modo de edição).
 * @param {string} pedidoId - O ID do pedido a ser carregado.
 */
async function carregarPedidoExistente(pedidoId) {
    const response = await fetch(`${URL_DA_API}get_pedido_detalhes.php?id=${pedidoId}`);
    const data = await response.json();

    if (data.sucesso) {
        // Converte os dados recebidos para o formato que usamos na variável 'pedidoAtual'
        pedidoAtual = data.itens.map(item => {
            const produtoDoCardapio = cardapio.find(p => p.nome === item.nome);
            return {
                ...produtoDoCardapio,
                quantidade: item.quantidade
            };
        });
        exibirPedidoAtual(); // Atualiza a tela com os itens já existentes
    }
}

/**
 * Busca a lista completa de produtos (o cardápio) na API.
 */
async function carregarCardapio() {
    const response = await fetch(URL_DA_API + 'get_produtos.php');
    cardapio = await response.json();
    exibirCardapio();
}

/**
 * Desenha a lista de produtos do cardápio na coluna da esquerda.
 */
function exibirCardapio() {
    listaProdutosEl.innerHTML = '';
    cardapio.forEach(produto => {
        const item = document.createElement('li');
        item.className = 'produto';
        item.innerHTML = `<span>${produto.nome} - R$ ${parseFloat(produto.preco).toFixed(2)}</span><button data-id="${produto.id}">Adicionar</button>`;
        listaProdutosEl.appendChild(item);
    });
}

/**
 * Adiciona um produto ao pedido atual na coluna da direita ou incrementa sua quantidade.
 * @param {string} produtoId - O ID do produto a ser adicionado.
 */
function adicionarAoPedido(produtoId) {
    const produto = cardapio.find(p => p.id == produtoId);
    const itemExistente = pedidoAtual.find(item => item.id == produtoId);
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        pedidoAtual.push({ ...produto, quantidade: 1 });
    }
    exibirPedidoAtual();
}

/**
 * Atualiza a lista de itens do pedido atual e o valor total na tela.
 */
function exibirPedidoAtual() {
    listaItensPedidoEl.innerHTML = '';
    let total = 0;
    pedidoAtual.forEach(item => {
        const itemEl = document.createElement('li');
        itemEl.textContent = `${item.quantidade}x ${item.nome} - R$ ${(item.quantidade * item.preco).toFixed(2)}`;
        listaItensPedidoEl.appendChild(itemEl);
        total += item.quantidade * item.preco;
    });
    valorTotalEl.textContent = total.toFixed(2);
}

/**
 * Salva um PEDIDO NOVO no banco de dados e dispara a impressão.
 */
async function criarPedido() {
    const response = await fetch(URL_DA_API + 'criar_pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: pedidoAtual })
    });
    const resultado = await response.json();

    if (resultado.sucesso) {
        alert(`Pedido Nº ${resultado.pedido_id} salvo com sucesso!`);
        
        // Dispara a impressão da comanda
        window.api.imprimirComanda(resultado); 

        // Volta para a página inicial
        window.location.href = 'index.html';
    } else {
        alert('Erro ao criar o pedido: ' + resultado.erro);
    }
}

/**
 * ATUALIZA um PEDIDO EXISTENTE no banco de dados.
 */
async function atualizarPedido() {
    const response = await fetch(URL_DA_API + 'atualizar_pedido.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pedido_id: idPedidoEdicao, itens: pedidoAtual })
    });
    const resultado = await response.json();
    if (resultado.sucesso) {
        alert(`Pedido Nº ${resultado.pedido_id} atualizado com sucesso!`);
        window.location.href = 'index.html';
    } else {
        alert('Erro ao atualizar o pedido: ' + resultado.erro);
    }
}


// --- CONFIGURAÇÃO DOS EVENTOS (LISTENERS) ---

// O botão "Salvar Pedido" decide se deve criar ou atualizar um pedido.
salvarPedidoBtn.addEventListener('click', () => {
    if (pedidoAtual.length === 0) {
        alert('Adicione pelo menos um item ao pedido.');
        return;
    }

    if (idPedidoEdicao) {
        atualizarPedido();
    } else {
        criarPedido();
    }
});

// Ouve cliques na lista de produtos para adicionar itens ao pedido.
listaProdutosEl.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        adicionarAoPedido(event.target.getAttribute('data-id'));
    }
});


// --- INICIALIZAÇÃO ---
// Inicia todo o processo quando a página é carregada.
iniciarPagina();


// --- INICIALIZAÇÃO ---
// Inicia todo o processo quando a página é carregada.
iniciarPagina();