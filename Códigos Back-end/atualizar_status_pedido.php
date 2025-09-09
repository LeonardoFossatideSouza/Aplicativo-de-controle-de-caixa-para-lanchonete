<?php
require_once 'conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);
$pedido_id = $dados['id'] ?? null;
$novo_status = $dados['status'] ?? null;
$status_validos = ['recebido', 'em preparo', 'entregue', 'pago', 'cancelado'];

if (!$pedido_id || !$novo_status || !in_array($novo_status, $status_validos)) {
    die(json_encode(['sucesso' => false, 'erro' => 'Dados inválidos para atualizar o status.']));
}

$stmt = $conexao->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
$stmt->bind_param("si", $novo_status, $pedido_id);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true]);
} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha ao atualizar o status do pedido.']);
}
$conexao->close();
?>