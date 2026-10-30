<?php
require_once __DIR__ . '/config.php';
$pdo = getDB();

$stmt = $pdo->query("SELECT id, name, price, description, stock_quantity, is_available FROM products ORDER BY id ASC");
$products = $stmt->fetchAll();

sendJson(['products' => $products]);