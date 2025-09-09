<?php
require_once 'conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

$pedido_id = $dados['pedido_id'] ?? null;
$itens = $dados['itens'] ?? [];

if (!$pedido_id || empty($itens)) {
    die(json_encode(['sucesso' => false, 'erro' => 'Dados incompletos para atualizar o pedido.']));
}

$valorTotal = 0;
foreach($itens as $item) {
    $valorTotal += $item['preco'] * $item['quantidade'];
}

$conexao->begin_transaction();
try {
    $stmt_delete = $conexao->prepare("DELETE FROM pedido_itens WHERE pedido_id = ?");
    $stmt_delete->bind_param("i", $pedido_id);
    $stmt_delete->execute();

    $stmt_insert = $conexao->prepare("INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
    foreach($itens as $item) {
        $produto_id = $item['id']; 
        $stmt_insert->bind_param("iiid", $pedido_id, $produto_id, $item['quantidade'], $item['preco']);
        $stmt_insert->execute();
    }

    $stmt_update = $conexao->prepare("UPDATE pedidos SET valor_total = ? WHERE id = ?");
    $stmt_update->bind_param("di", $valorTotal, $pedido_id);
    $stmt_update->execute();

    $conexao->commit();
    echo json_encode(['sucesso' => true, 'pedido_id' => $pedido_id]);
} catch (mysqli_sql_exception $exception) {
    $conexao->rollback();
    echo json_encode(['sucesso' => false, 'erro' => $exception->getMessage()]);
}
$conexao->close();
?>