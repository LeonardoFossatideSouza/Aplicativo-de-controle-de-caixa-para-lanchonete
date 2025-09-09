<?php
require_once 'conexao.php';

$sql = "SELECT id, nome, descricao, preco, categoria FROM produtos ORDER BY nome ASC";
$resultado = $conexao->query($sql);

if ($resultado === false) {
    die(json_encode(['sucesso' => false, 'erro' => 'Erro na consulta SQL: ' . $conexao->error]));
}

$produtos = [];
while ($linha = $resultado->fetch_assoc()) {
    $produtos[] = $linha;
}

echo json_encode($produtos);
$conexao->close();
?>