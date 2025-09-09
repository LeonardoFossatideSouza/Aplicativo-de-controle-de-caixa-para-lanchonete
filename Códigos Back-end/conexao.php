<?php
// Força a exibição de todos os erros de PHP (ótimo para depuração)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Define o cabeçalho para garantir que a resposta seja JSON com caracteres UTF-8
header("Content-Type: application/json; charset=UTF-8");
// Permite que seu app Electron (de qualquer origem) acesse esta API
header("Access-Control-Allow-Origin: *");

// --- INFORMAÇÕES DO VÍNCULO COM O BANCO DE DADOS ---
$servidor = "localhost";
$usuario = "root";
$senha = "";
$banco = "paraiso_lanches_db";

// --- COMANDO PARA CRIAR O VÍNCULO ---
$conexao = new mysqli($servidor, $usuario, $senha, $banco);

// --- VERIFICAÇÃO DO VÍNCULO ---
if ($conexao->connect_error) {
    die(json_encode(['sucesso' => false, 'erro' => "Falha na conexão: " . $conexao->connect_error]));
}
?>