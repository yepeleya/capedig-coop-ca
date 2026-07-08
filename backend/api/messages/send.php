<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../_helpers.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data    = getJsonBody();
$sujet   = trim($data['sujet']   ?? '');
$contenu = trim($data['contenu'] ?? '');

if (!$contenu) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Contenu requis']);
    exit;
}

$expId   = $auth['id'];
$expType = $auth['type'] === 'admin' ? 'admin' : 'producteur';
// Les messages vont toujours vers l'admin (destinataire_id = 1 = super admin)
$destId   = 1;
$destType = 'admin';

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "INSERT INTO message
         (expediteur_id, expediteur_type, destinataire_id, destinataire_type, sujet, contenu)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$expId, $expType, $destId, $destType, $sujet, $contenu]);

    if ($destType === 'admin') {
        creerNotification($pdo, 'message', "Nouveau message reçu" . ($sujet ? " : $sujet" : ''), '/admin/messages');
    }

    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
