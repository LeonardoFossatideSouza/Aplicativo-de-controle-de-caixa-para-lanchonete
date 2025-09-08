const URL_DA_API = 'http://localhost:8080/api_lanches/';
const formLogin = document.getElementById('form-login');
const mensagemErro = document.getElementById('mensagem-erro');

formLogin.addEventListener('submit', async (event) => {
    event.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    const response = await fetch(URL_DA_API + 'login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
    });
    const resultado = await response.json();

    if (resultado.sucesso) {
        // Guarda os dados do usuário na sessão para usar em outras telas
        sessionStorage.setItem('usuarioLogado', JSON.stringify({
            nome: resultado.nome,
            cargo: resultado.cargo,
            usuario: usuario // Guardamos o nome de usuário também
        }));

        if (resultado.primeiro_acesso) {
            window.location.href = 'primeiro_acesso.html';
        } else {
            window.location.href = 'index.html';
        }
    } else {
        mensagemErro.textContent = resultado.erro;
    }
});