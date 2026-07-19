<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
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

    // Un producteur ne peut clôturer que sa propre conversation
    if ($auth['type'] === 'producteur') {
        $check = $pdo->prepare("SELECT id FROM conversation WHERE id = ? AND producteur_id = ?");
        $check->execute([$convId, $auth['id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['success' => false]);
            exit;
        }
    }

    $pdo->prepare("UPDATE conversation SET statut = 'close', updated_at = NOW() WHERE id = ?")
        ->execute([$convId]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('conversations/cloturer.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false]);
}
