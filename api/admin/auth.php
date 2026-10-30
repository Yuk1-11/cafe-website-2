<?php
require_once __DIR__ . '/../config.php';

$action = $_GET['action'] ?? '';

if ($action === 'check') {
    sendJson(['authenticated' => !empty($_SESSION['is_staff'])]);
}

if ($action === 'login') {
    $input = json_decode(file_get_contents('php://input'), true);
    $password = $input['password'] ?? '';

    if ($password === STAFF_PASSWORD) {
        $_SESSION['is_staff'] = true;
        sendJson(['success' => true]);
    } else {
        sendJson(['error' => '合言葉が違います'], 401);
    }
}

if ($action === 'logout') {
    $_SESSION['is_staff'] = false;
    session_destroy();
    sendJson(['success' => true]);
}