<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

// Seul un administrateur peut supprimer définitivement une conversation
if ($auth['type'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}

$data   = getJsonBody();
$convId = (int)($data['id'] ?? 0);

if (!$convId) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->beginTransaction();

    $pdo->prepare("DELETE FROM message WHERE conversation_id = ?")->execute([$convId]);
    $pdo->prepare("DELETE FROM conversation WHERE id = ?")->execute([$convId]);

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('conversations/supprimer.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false]);
}
