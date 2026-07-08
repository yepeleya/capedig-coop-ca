<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$type = $auth['type'] === 'producteur' ? 'producteur' : 'admin';
$destinataireId = $type === 'producteur' ? $auth['id'] : 1;

$data = getJsonBody();
$id   = (int)($data['id'] ?? 0);

try {
    $pdo = getConnection();
    if ($id) {
        $pdo->prepare(
            "UPDATE notification SET lu = 1 WHERE id = ? AND destinataire_type = ? AND destinataire_id = ?"
        )->execute([$id, $type, $destinataireId]);
    } else {
        $pdo->prepare(
            "UPDATE notification SET lu = 1 WHERE destinataire_type = ? AND destinataire_id = ? AND lu = 0"
        )->execute([$type, $destinataireId]);
    }
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false]);
}
