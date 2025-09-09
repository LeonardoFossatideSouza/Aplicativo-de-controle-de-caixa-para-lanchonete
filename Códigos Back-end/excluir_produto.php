<?php
// Inclui o arquivo de conexão com o banco de dados.
// Se a conexão falhar, este script já para com um erro claro.
require_once 'conexao.php';

// Lê o corpo da requisição, que o JavaScript envia em formato JSON.
$dados = json_decode(file_get_contents("php://input"), true);

// Pega o ID de dentro dos dados recebidos. Se não existir, define como nulo.
$id = $dados['id'] ?? null;

// Validação de segurança: verifica se o ID foi realmente enviado e se é um número.
// Isso previne erros e tentativas de ataque.
if (!$id || !is_numeric($id)) {
    die(json_encode(['sucesso' => false, 'erro' => 'ID do produto é inválido.']));
}

// Prepara a instrução SQL para deletar. Usar '?' é uma prática de segurança
// chamada "prepared statement", que evita ataques de injeção de SQL.
$stmt = $conexao->prepare("DELETE FROM produtos WHERE id = ?");

// Vincula a variável $id ao '?' na instrução SQL, especificando que é um inteiro ("i").
$stmt->bind_param("i", $id);

// Executa a instrução preparada.
if ($stmt->execute()) {
    // Após executar, verifica se alguma linha foi realmente afetada/deletada.
    if ($stmt->affected_rows > 0) {
        // Se 1 ou mais linhas foram afetadas, a exclusão foi um sucesso.
        echo json_encode(['sucesso' => true]);
    } else {
        // Se 0 linhas foram afetadas, significa que o ID enviado não existe no banco.
        echo json_encode(['sucesso' => false, 'erro' => 'Nenhum produto encontrado com este ID.']);
    }
} else {
    // Se a execução do SQL falhou por outro motivo, informa o erro.
    echo json_encode(['sucesso' => false, 'erro' => 'Falha ao executar a exclusão no banco de dados.']);
}

// Fecha a conexão com o banco de dados.
$conexao->close();
?>