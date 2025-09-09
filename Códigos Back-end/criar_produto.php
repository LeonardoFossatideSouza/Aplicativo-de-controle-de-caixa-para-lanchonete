<?php
require_once 'conexao.php';

$dados = json_decode(file_get_contents("php://input"), true);

if (empty($dados['nome']) || !isset($dados['preco'])) {
    die(json_encode(['sucesso' => false, 'erro' => 'Nome e preço são obrigatórios.']));
}

$nome = $dados['nome'];
$descricao = $dados['descricao'] ?? '';
$preco = $dados['preco'];
$categoria = $dados['categoria'] ?? 'Geral';

$stmt = $conexao->prepare("INSERT INTO produtos (nome, descricao, preco, categoria) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssds", $nome, $descricao, $preco, $categoria);

if ($stmt->execute()) {
    echo json_encode(['sucesso' => true, 'id' => $conexao->insert_id]);
} else {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha ao cadastrar o produto.']);
}
$conexao->close();
?>