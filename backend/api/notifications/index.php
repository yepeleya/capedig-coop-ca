<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

$type = $auth['type'] === 'producteur' ? 'producteur' : 'admin';
// Les notifications admin sont partagées par toute l'équipe (destinataire_id=1),
// celles des producteurs sont strictement personnelles.
$destinataireId = $type === 'producteur' ? $auth['id'] : 1;

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, type, message, lien, lu, created_at
         FROM notification
         WHERE destinataire_type = ? AND destinataire_id = ?
         ORDER BY created_at DESC
         LIMIT 30"
    );
    $stmt->execute([$type, $destinataireId]);
    $notifications = $stmt->fetchAll();

    $stmtCount = $pdo->prepare(
        "SELECT COUNT(*) FROM notification WHERE destinataire_type = ? AND destinataire_id = ? AND lu = 0"
    );
    $stmtCount->execute([$type, $destinataireId]);
    $nonLues = (int)$stmtCount->fetchColumn();

    echo json_encode(['notifications' => $notifications, 'non_lues' => $nonLues]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['notifications' => [], 'non_lues' => 0]);
}
