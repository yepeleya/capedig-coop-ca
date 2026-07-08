<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../_helpers.php';

setSecurityHeaders();
rateLimit('verifier_sms', max: 8, window: 300);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data          = getJsonBody();
$producteurId  = (int)($data['producteur_id'] ?? 0);
$code          = trim($data['code'] ?? '');

if (!$producteurId || !$code) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, code_sms, code_sms_expire, tel_verifie
         FROM producteur WHERE id = ?"
    );
    $stmt->execute([$producteurId]);
    $prd = $stmt->fetch();

    if (!$prd) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Compte introuvable']);
        exit;
    }

    if ($prd['tel_verifie']) {
        echo json_encode(['success' => true, 'message' => 'Numéro déjà vérifié']);
        exit;
    }

    if (!$prd['code_sms'] || !$prd['code_sms_expire'] || strtotime($prd['code_sms_expire']) < time()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Code expiré. Demandez un nouveau code.']);
        exit;
    }

    if (!hash_equals($prd['code_sms'], $code)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Code incorrect']);
        exit;
    }

    $pdo->prepare(
        "UPDATE producteur SET tel_verifie = 1, code_sms = NULL, code_sms_expire = NULL WHERE id = ?"
    )->execute([$producteurId]);

    echo json_encode(['success' => true, 'message' => 'Numéro vérifié avec succès']);
} catch (PDOException $e) {
    error_log('auth/verifier_sms.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
