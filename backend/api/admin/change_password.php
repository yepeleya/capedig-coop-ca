<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

$data       = getJsonBody();
$nouveauMdp = $data['nouveau_mdp'] ?? '';

if (strlen($nouveauMdp) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Minimum 8 caractères']);
    exit;
}

try {
    $pdo  = getConnection();
    $hash = password_hash($nouveauMdp, PASSWORD_BCRYPT, ['cost' => 10]);
    $pdo->prepare("UPDATE admin SET mot_de_passe = ? WHERE id = ?")
        ->execute([$hash, $auth['id']]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false]);
}
