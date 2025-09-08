// Porteiro: só deixa administradores entrarem
const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
if (!usuarioLogado || usuarioLogado.cargo !== 'administrador') {
    alert('Acesso negado!');
    window.location.href = 'index.html';
}

const URL_DA_API = 'http://localhost:8080/api_lanches/';
const formCadastro = document.getElementById('form-cadastro-func');

formCadastro.addEventListener('submit', async (event) => {
    event.preventDefault();
    const nome = document.getElementById('nome-func').value;
    const usuario = document.getElementById('usuario-func').value;

    const response = await fetch(URL_DA_API + 'cadastrar_funcionario.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, usuario })
    });
    const resultado = await response.json();

    if (resultado.sucesso) {
        alert(`Funcionário cadastrado com sucesso!\nA senha padrão é: ${resultado.senha_padrao}\nAnote e entregue ao funcionário.`);
        formCadastro.reset();
    } else {
        alert('Erro: ' + resultado.erro);
    }
});