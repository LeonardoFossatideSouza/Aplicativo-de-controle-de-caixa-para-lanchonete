<?php
require_once 'conexao.php';
$dados = json_decode(file_get_contents("php://input"), true);
$usuario = $dados['usuario'] ?? '';
$nova_senha = $dados['nova_senha'] ?? '';

if(empty($usuario) || empty($nova_senha) || strlen($nova_senha) < 6) {
    die(json_encode(['sucesso' => false, 'erro' => 'Nova senha deve ter pelo menos 6 caracteres.']));
}

$nova_senha_hash = password_hash($nova_senha, PASSWORD_DEFAULT);

$stmt = $conexao->prepare("UPDATE usuarios SET senha = ?, primeiro_acesso = FALSE WHERE usuario = ?");
$stmt->bind_param("ss", $nova_senha_hash, $usuario);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true]);
} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha ao atualizar a senha.']);
}
$conexao->close();
?>
