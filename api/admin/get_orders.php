<?php
require_once __DIR__ . '/../config.php';
if (empty($_SESSION['is_staff'])) sendJson(['error' => '未ログイン'], 401);

$pdo = getDB();

$stmt = $pdo->query("SELECT * FROM orders WHERE DATE(created_at) = CURDATE() ORDER BY id DESC");
$orders = $stmt->fetchAll();

// 明細も合わせて取得
$stmtItems = $pdo->prepare("SELECT product_name, quantity, unit_price FROM order_items WHERE order_id = ?");
foreach ($orders as &$order) {
    $stmtItems->execute([$order['id']]);
    $order['items'] = $stmtItems->fetchAll();
}

sendJson(['orders' => $orders]);