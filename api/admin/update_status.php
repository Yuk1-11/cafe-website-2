<?php
require_once __DIR__ . '/../config.php';
if (empty($_SESSION['is_staff'])) sendJson(['error' => '未ログイン'], 401);

$input = json_decode(file_get_contents('php://input'), true);
$orderId = (int)($input['order_id'] ?? 0);
$status = $input['status'] ?? '';

$validStatuses = ['preparing', 'ready', 'completed', 'cancelled'];
if (!$orderId || !in_array($status, $validStatuses, true)) {
    sendJson(['error' => '無効なリクエスト'], 400);
}

$pdo = getDB();
$stmt = $pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
$stmt->execute([$status, $orderId]);

sendJson(['success' => true]);