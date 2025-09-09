?php
require_once 'conexao.php';
$dados = json_decode(file_get_contents("php://input"), true);

$nome = $dados['nome'] ?? '';
$usuario = $dados['usuario'] ?? '';
$senha_padrao = 'mudar123'; // Senha padrão de primeiro acesso
$senha_hash = password_hash($senha_padrao, PASSWORD_DEFAULT);

if (empty($nome) || empty($usuario)) {
    die(json_encode(['sucesso' => false, 'erro' => 'Nome e usuário são obrigatórios.']));
}

$stmt = $conexao->prepare("INSERT INTO usuarios (nome, usuario, senha, cargo, primeiro_acesso) VALUES (?, ?, ?, 'funcionario', TRUE)");
$stmt->bind_param("sss", $nome, $usuario, $senha_hash);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true, 'senha_padrao' => $senha_padrao]);
} else {
    // Código '1062' é erro de entrada duplicada (usuário já existe)
    if ($conexao->errno === 1062) {
        echo json_encode(['sucesso' => false, 'erro' => 'Este nome de usuário já está em uso.']);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => 'Falha ao cadastrar funcionário.']);
    }
}
$conexao->close();
?>
