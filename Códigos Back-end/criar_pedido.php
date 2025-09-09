<?php
require_once 'conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

if (empty($dados['itens']) || !is_array($dados['itens'])) {
    die(json_encode(['sucesso' => false, 'erro' => 'Nenhum item no pedido.']));
}

$valorTotal = 0;
foreach($dados['itens'] as $item) {
    $valorTotal += $item['preco'] * $item['quantidade'];
}

$conexao->begin_transaction();
try {
    $stmt = $conexao->prepare("INSERT INTO pedidos (nome_cliente, valor_total, status) VALUES (?, ?, 'recebido')");
    $cliente = $dados['cliente'] ?? 'Balcão';
    $stmt->bind_param("sd", $cliente, $valorTotal);
    $stmt->execute();
    
    $pedido_id = $conexao->insert_id;

    $stmt_item = $conexao->prepare("INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
    foreach($dados['itens'] as $item) {
        $stmt_item->bind_param("iiid", $pedido_id, $item['id'], $item['quantidade'], $item['preco']);
        $stmt_item->execute();
    }
    
    $conexao->commit();
    echo json_encode(['sucesso' => true, 'pedido_id' => $pedido_id]);
} catch (mysqli_sql_exception $exception) {
    $conexao->rollback();
    echo json_encode(['sucesso' => false, 'erro' => $exception->getMessage()]);
}
$conexao->close();
?>