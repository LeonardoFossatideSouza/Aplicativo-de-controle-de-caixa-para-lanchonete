// "Porteiro": Verifica se há um usuário logado. Se não, redireciona para o login.
const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

const URL_DA_API = 'http://localhost:8080/api_lanches/';

// --- Elementos do DOM ---
const formCadastro = document.getElementById('form-cadastro');
const tabelaProdutosBody = document.querySelector('#corpo-tabela-produtos');

// --- Funções ---

/**
 * Carrega todos os produtos da API e exibe na tabela.
 * Agora, a coluna "Ação" muda de acordo com o cargo do usuário.
 */
async function carregarProdutos() {
    try {
        const response = await fetch(URL_DA_API + 'get_produtos.php');
        const produtos = await response.json();
        
        tabelaProdutosBody.innerHTML = '';
        produtos.forEach(produto => {
            const tr = document.createElement('tr');

            // Define a coluna de Ação (com ou sem o botão de excluir)
            let acaoHtml = '<td>Visualizar</td>'; // Texto padrão para funcionários
            if (usuarioLogado.cargo === 'administrador') {
                acaoHtml = `<td><span class="btn-excluir" data-id="${produto.id}">Excluir</span></td>`;
            }

            tr.innerHTML = `
                <td>${produto.nome}</td>
                <td>R$ ${parseFloat(produto.preco).toFixed(2)}</td>
                <td>${produto.categoria}</td>
                ${acaoHtml}
            `;
            tabelaProdutosBody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        tabelaProdutosBody.innerHTML = `<tr><td colspan="4">Não foi possível carregar o cardápio. Verifique a API.</td></tr>`;
    }
}


// --- LÓGICA E EVENTOS ESPECÍFICOS DO ADMINISTRADOR ---

// Verificamos o cargo do usuário ANTES de definir as funções e os eventos de admin.
if (usuarioLogado.cargo === 'administrador') {

    /**
     * Pega os dados do formulário e os envia para a API para criar um novo produto.
     * (Esta função só existe para administradores)
     */
    async function cadastrarProduto(event) {
        event.preventDefault();
        const dadosProduto = {
            nome: document.getElementById('nome').value,
            descricao: document.getElementById('descricao').value,
            preco: document.getElementById('preco').value,
            categoria: document.getElementById('categoria').value
        };
        const response = await fetch(URL_DA_API + 'criar_produto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dadosProduto)
        });
        const resultado = await response.json();
        if (resultado.sucesso) {
            alert('Produto cadastrado com sucesso!');
            formCadastro.reset();
            document.getElementById('nome').focus();
            carregarProdutos();
        } else {
            alert('Erro ao cadastrar: ' + resultado.erro);
        }
    }

    /**
     * Envia o ID de um produto para a API para desativação ("exclusão").
     * (Esta função só existe para administradores)
     */
    async function excluirProduto(produtoId) {
        if (!confirm('Tem certeza que deseja remover este produto do cardápio?')) {
            return;
        }
        const response = await fetch(URL_DA_API + 'desativar_produto.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: produtoId })
        });
        const resultado = await response.json();
        if (resultado.sucesso) {
            alert('Produto removido com sucesso!');
            carregarProdutos();
        } else {
            alert('Erro ao remover produto: ' + resultado.erro);
        }
    }

    // Adiciona os "ouvintes" de eventos APENAS se for administrador
    formCadastro.addEventListener('submit', cadastrarProduto);
    tabelaProdutosBody.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-excluir')) {
            const produtoId = event.target.getAttribute('data-id');
            excluirProduto(produtoId);
        }
    });

} else {
    // --- LÓGICA PARA FUNCIONÁRIOS ---
    // Se o formulário de cadastro existir na página, ele é escondido.
    if (formCadastro) {
        formCadastro.style.display = 'none';
        // Também podemos esconder o título H3 que fica acima do formulário
        const tituloForm = formCadastro.querySelector('h3');
        if (tituloForm) {
            tituloForm.style.display = 'none';
        }
    }
}

// --- INICIALIZAÇÃO ---
// Esta função é executada para todos, mas o conteúdo da tabela muda conforme o cargo.
carregarProdutos();