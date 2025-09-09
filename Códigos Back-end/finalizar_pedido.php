<?php
require_once 'conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);
$pedido_id = $dados['id'] ?? null;

if (!$pedido_id) {
    die(json_encode(['sucesso' => false, 'erro' => 'ID do pedido não fornecido.']));
}

$stmt = $conexao->prepare("UPDATE pedidos SET status = 'pago' WHERE id = ?");
$stmt->bind_param("i", $pedido_id);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true]);
} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha ao atualizar o pedido.']);
}

$conexao->close();
?>