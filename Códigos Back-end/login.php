<?php
require_once 'conexao.php';

// Inserindo o usuário admin na primeira vez que este script for rodado
$checkAdmin = $conexao->query("SELECT id FROM usuarios WHERE usuario = 'admin'");
if ($checkAdmin->num_rows === 0) {
    $senhaAdminHash = password_hash('admin', PASSWORD_DEFAULT);
    $conexao->query("INSERT INTO usuarios (nome, usuario, senha, cargo, primeiro_acesso) VALUES ('Administrador', 'admin', '{$senhaAdminHash}', 'administrador', 0)");
}

$dados = json_decode(file_get_contents("php://input"), true);
$usuario = $dados['usuario'] ?? '';
$senha = $dados['senha'] ?? '';

if (empty($usuario) || empty($senha)) {
    die(json_encode(['sucesso' => false, 'erro' => 'Usuário e senha são obrigatórios.']));
}

$stmt = $conexao->prepare("SELECT senha, nome, cargo, primeiro_acesso FROM usuarios WHERE usuario = ?");
$stmt->bind_param("s", $usuario);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 1) {
    $user = $resultado->fetch_assoc();
    if (password_verify($senha, $user['senha'])) {
        echo json_encode([
            'sucesso' => true,
            'nome' => $user['nome'],
            'cargo' => $user['cargo'],
            'primeiro_acesso' => (bool)$user['primeiro_acesso']
        ]);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => 'Senha incorreta.']);
    }
} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Usuário não encontrado.']);
}
$conexao->close();
?>
