<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../_helpers.php';

setSecurityHeaders();
requireAuth(); // admin seulement en pratique

$data       = getJsonBody();
$messageId  = (int)($data['message_id'] ?? 0);
$reponse    = trim($data['reponse']     ?? '');

if (!$messageId || !$reponse) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

try {
    $pdo  = getConnection();

    $stmt = $pdo->prepare(
        "SELECT expediteur_id, expediteur_type, sujet FROM message WHERE id = ?"
    );
    $stmt->execute([$messageId]);
    $msg = $stmt->fetch();

    if (!$msg) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Message introuvable']);
        exit;
    }

    $pdo->prepare("UPDATE message SET reponse = ?, lu = 1 WHERE id = ?")
        ->execute([$reponse, $messageId]);

    if ($msg['expediteur_type'] === 'producteur') {
        creerNotification(
            $pdo, 'reponse',
            "L'administration a répondu à votre message" . ($msg['sujet'] ? " : {$msg['sujet']}" : ''),
            '/producteur/dashboard',
            'producteur', (int)$msg['expediteur_id']
        );
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('messages/repondre.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false]);
}
