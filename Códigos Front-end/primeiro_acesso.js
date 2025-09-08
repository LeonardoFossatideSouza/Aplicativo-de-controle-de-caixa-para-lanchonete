const URL_DA_API = 'http://localhost:8080/api_lanches/';
const formNovaSenha = document.getElementById('form-nova-senha');
const mensagemErro = document.getElementById('mensagem-erro');
const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));

// Se não houver usuário na sessão, volta para o login
if (!usuarioLogado) {
    window.location.href = 'login.html';
}

formNovaSenha.addEventListener('submit', async (event) => {
    event.preventDefault();
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmaSenha = document.getElementById('confirma-senha').value;

    if (novaSenha !== confirmaSenha) {
        mensagemErro.textContent = 'As senhas não coincidem.';
        return;
    }
    if (novaSenha.length < 6) {
        mensagemErro.textContent = 'A senha deve ter no mínimo 6 caracteres.';
        return;
    }

    const response = await fetch(URL_DA_API + 'atualizar_senha.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario: usuarioLogado.usuario, nova_senha: novaSenha })
    });
    const resultado = await response.json();

    if (resultado.sucesso) {
        alert('Senha atualizada com sucesso! Você será redirecionado para a tela principal.');
        window.location.href = 'index.html';
    } else {
        mensagemErro.textContent = resultado.erro;
    }
});