<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($auth['type'] !== 'producteur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès refusé']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data        = getJsonBody();
$ancienMdp   = $data['ancien_mdp']   ?? '';
$nouveauMdp  = $data['nouveau_mdp']  ?? '';

if (!$ancienMdp || !$nouveauMdp) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Ancien et nouveau mot de passe requis']);
    exit;
}

if (mb_strlen($nouveauMdp) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le nouveau mot de passe doit faire au moins 8 caractères']);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("SELECT password_hash FROM producteur WHERE id = ?");
    $stmt->execute([$auth['id']]);
    $hash = $stmt->fetchColumn();

    if (!$hash || !password_verify($ancienMdp, $hash)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Ancien mot de passe incorrect']);
        exit;
    }

    $nouveauHash = password_hash($nouveauMdp, PASSWORD_BCRYPT);
    $pdo->prepare("UPDATE producteur SET password_hash = ? WHERE id = ?")
        ->execute([$nouveauHash, $auth['id']]);

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('producteurs/change_password.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
