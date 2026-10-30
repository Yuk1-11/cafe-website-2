<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();

$input = json_decode(file_get_contents('php://input'), true);
$cart = $input['items'] ?? [];

if (empty($cart)) {
    sendJson(['error' => 'カートが空です'], 400);
}

try {
    $pdo->beginTransaction();

    $totalPrice = 0;
    $orderItemsData = [];

    foreach ($cart as $item) {
        $productId = (int)$item['id'];
        $qty = (int)$item['quantity'];
        if ($qty <= 0) continue;

        // 排他ロックで在庫確認
        $stmt = $pdo->prepare("SELECT id, name, price, stock_quantity, is_available FROM products WHERE id = ? FOR UPDATE");
        $stmt->execute([$productId]);
        $prod = $stmt->fetch();

        if (!$prod || !$prod['is_available'] || $prod['stock_quantity'] < $qty) {
            $pdo->rollBack();
            sendJson(['error' => ($prod['name'] ?? '商品') . ' の在庫が不足しています'], 400);
        }

        // 在庫減算
        $updateStmt = $pdo->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
        $updateStmt->execute([$qty, $productId]);

        $itemTotal = $prod['price'] * $qty;
        $totalPrice += $itemTotal;

        $orderItemsData[] = [
            'id' => $prod['id'],
            'name' => $prod['name'],
            'price' => $prod['price'],
            'quantity' => $qty
        ];
    }

    // 今日の通し注文番号を発行 (例: #101, #102...)
    $stmtCount = $pdo->query("SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()");
    $countToday = $stmtCount->fetchColumn();
    $orderNumber = '#' . str_pad($countToday + 101, 3, '0', STR_PAD_LEFT);

    // 注文ヘッダー挿入
    $stmtOrder = $pdo->prepare("INSERT INTO orders (order_number, total_price, status) VALUES (?, ?, 'preparing')");
    $stmtOrder->execute([$orderNumber, $totalPrice]);
    $orderId = $pdo->lastInsertId();

    // 注文明細挿入
    $stmtItem = $pdo->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES (?, ?, ?, ?, ?)");
    foreach ($orderItemsData as $d) {
        $stmtItem->execute([$orderId, $d['id'], $d['name'], $d['quantity'], $d['price']]);
    }

    $pdo->commit();
    sendJson([
        'success' => true,
        'order_number' => $orderNumber,
        'total_price' => $totalPrice
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJson(['error' => '注文処理中にエラーが発生しました'], 500);
}