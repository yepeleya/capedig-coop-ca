<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

// Seul un administrateur peut bloquer un producteur dans une conversation
if ($auth['type'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false]);
    exit;
}

$data    = getJsonBody();
$convId  = (int)($data['id'] ?? 0);
$bloquer = !empty($data['bloque']);

if (!$convId) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $pdo = getConnection();

    $pdo->prepare("UPDATE conversation SET bloquee = ?, updated_at = NOW() WHERE id = ?")
        ->execute([$bloquer ? 1 : 0, $convId]);

    echo json_encode(['success' => true, 'bloquee' => $bloquer]);
} catch (PDOException $e) {
    error_log('conversations/bloquer.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false]);
}
