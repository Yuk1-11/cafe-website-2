<?php
require_once __DIR__ . '/../config.php';
if (empty($_SESSION['is_staff'])) sendJson(['error' => '未ログイン'], 401);

$input = json_decode(file_get_contents('php://input'), true);
$productId = (int)($input['product_id'] ?? 0);
$stock = isset($input['stock']) ? (int)$input['stock'] : null;
$isAvailable = isset($input['is_available']) ? (int)$input['is_available'] : null;

$pdo = getDB();
if ($stock !== null) {
    $stmt = $pdo->prepare("UPDATE products SET stock_quantity = ? WHERE id = ?");
    $stmt->execute([$stock, $productId]);
}
if ($isAvailable !== null) {
    $stmt = $pdo->prepare("UPDATE products SET is_available = ? WHERE id = ?");
    $stmt->execute([$isAvailable, $productId]);
}

sendJson(['success' => true]);