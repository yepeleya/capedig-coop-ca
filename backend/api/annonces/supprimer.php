<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); exit;
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) { http_response_code(400); exit; }

try {
    $pdo = getConnection();
    $pdo->prepare("DELETE FROM annonce WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false]);
}
