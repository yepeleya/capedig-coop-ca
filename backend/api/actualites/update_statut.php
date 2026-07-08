<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

$data   = getJsonBody();
$id     = (int)($data['id']     ?? 0);
$statut = trim($data['statut']  ?? '');

if (!$id || !in_array($statut, ['publiee', 'brouillon', 'programmee'])) {
    http_response_code(400);
    echo json_encode(['success' => false]);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->prepare("UPDATE actualite SET statut = ? WHERE id = ?")
        ->execute([$statut, $id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false]);
}
