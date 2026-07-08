<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

$data = getJsonBody();
$nom      = trim($data['nom']      ?? 'CAPEDIG-COOP CA');
$adresse  = trim($data['adresse']  ?? '');
$contact  = trim($data['contact']  ?? '');
$agrement = trim($data['agrement'] ?? '');
$site     = trim($data['site']     ?? '');

if (!$nom) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Nom de la coopérative requis']);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->prepare(
        "INSERT INTO config_coop (id, nom, adresse, contact, agrement, site)
         VALUES (1, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
            nom = VALUES(nom), adresse = VALUES(adresse),
            contact = VALUES(contact), agrement = VALUES(agrement), site = VALUES(site)"
    )->execute([$nom, $adresse, $contact, $agrement, $site]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
