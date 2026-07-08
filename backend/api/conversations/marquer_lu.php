<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data           = getJsonBody();
$convId         = (int)($data['conversation_id'] ?? 0);
$recipientType  = $auth['type'] === 'admin' ? 'producteur' : 'admin';

if (!$convId) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->prepare("
        UPDATE message SET lu = 1
        WHERE conversation_id = ? AND expediteur_type = ? AND lu = 0
    ")->execute([$convId, $recipientType]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false]);
}
