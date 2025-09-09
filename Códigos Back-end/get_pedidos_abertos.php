<?php
require_once 'conexao.php';

$sql = "SELECT id, nome_cliente, valor_total, status, DATE_FORMAT(data_pedido, '%H:%i') as hora 
        FROM pedidos 
        WHERE status IN ('recebido', 'em preparo', 'entregue') 
        ORDER BY FIELD(status, 'entregue', 'em preparo', 'recebido'), data_pedido ASC";

$resultado = $conexao->query($sql);

if ($resultado === false) {
    die(json_encode(['sucesso' => false, 'erro' => 'Erro na consulta SQL: ' . $conexao->error]));
}

$pedidos = [];
while ($linha = $resultado->fetch_assoc()) {
    $pedidos[] = $linha;
}

echo json_encode($pedidos);
$conexao->close();
?>