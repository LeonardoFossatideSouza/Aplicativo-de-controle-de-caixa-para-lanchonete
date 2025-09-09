<?php
require_once 'conexao.php';

$pedido_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);

if (!$pedido_id) {
    die(json_encode(['sucesso' => false, 'erro' => 'ID do pedido inválido.']));
}

$sql = "SELECT pi.quantidade, pi.preco_unitario, p.nome 
        FROM pedido_itens pi
        JOIN produtos p ON pi.produto_id = p.id
        WHERE pi.pedido_id = ?";

$stmt = $conexao->prepare($sql);
$stmt->bind_param("i", $pedido_id);
$stmt->execute();
$resultado = $stmt->get_result();

$itens = [];
while ($linha = $resultado->fetch_assoc()) {
    $itens[] = $linha;
}

echo json_encode(['sucesso' => true, 'itens' => $itens]);
$conexao->close();
?>