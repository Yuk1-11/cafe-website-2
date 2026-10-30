<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();

$orderNum = $_GET['order_number'] ?? '';
if (!$orderNum) {
    sendJson(['error' => '注文番号がありません'], 400);
}

$stmt = $pdo->prepare("SELECT order_number, total_price, status, created_at FROM orders WHERE order_number = ?");
$stmt->execute([$orderNum]);
$order = $stmt->fetch();

if (!$order) {
    sendJson(['error' => '注文が見つかりません'], 404);
}

sendJson(['order' => $order]);