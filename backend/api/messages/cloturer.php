<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth(); // admin seulement en pratique

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data = getJsonBody();
$id   = (int)($data['id'] ?? 0);

if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->prepare("UPDATE message SET resolu = 1, lu = 1 WHERE id = ?")->execute([$id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('messages/cloturer.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
