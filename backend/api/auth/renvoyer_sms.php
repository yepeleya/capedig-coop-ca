<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../_helpers.php';
require_once __DIR__ . '/../../config/sms.php';

setSecurityHeaders();
rateLimit('renvoyer_sms', max: 3, window: 300);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data         = getJsonBody();
$producteurId = (int)($data['producteur_id'] ?? 0);

if (!$producteurId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("SELECT id, telephone, tel_verifie FROM producteur WHERE id = ?");
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

    $codeSms   = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $smsExpire = date('Y-m-d H:i:s', time() + 600);

    $pdo->prepare("UPDATE producteur SET code_sms = ?, code_sms_expire = ? WHERE id = ?")
        ->execute([$codeSms, $smsExpire, $producteurId]);

    envoyerSms($prd['telephone'], "CAPEDIG-COOP CA : votre code de verification est $codeSms. Valable 10 minutes.");

    echo json_encode(['success' => true, 'message' => 'Nouveau code envoyé']);
} catch (PDOException $e) {
    error_log('auth/renvoyer_sms.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
