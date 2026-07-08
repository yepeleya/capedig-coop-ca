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

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, nom, prenom, email, telephone, localisation, section,
                code_producteur, statut, photo, created_at
         FROM producteur WHERE id = ?"
    );
    $stmt->execute([$auth['id']]);
    $p = $stmt->fetch();

    if (!$p) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Introuvable']);
        exit;
    }

    // URL photo complète si présente
    if ($p['photo']) {
        $p['photo_url'] = '/uploads/' . $p['photo'];
    } else {
        $p['photo_url'] = null;
    }

    echo json_encode(['success' => true, 'profil' => $p]);
} catch (PDOException $e) {
    error_log('producteurs/profil.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
