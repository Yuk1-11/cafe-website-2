<?php
// Copy this file to api/config.php and set values for your environment.
session_start();

define('DB_HOST', 'localhost');
define('DB_NAME', 'cafe_db');
define('DB_USER', 'your_database_user');
define('DB_PASS', 'your_database_password');
define('STAFF_PASSWORD', 'replace_with_a_strong_staff_password');

function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'データベース接続エラー']);
            exit;
        }
    }
    return $pdo;
}

function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
