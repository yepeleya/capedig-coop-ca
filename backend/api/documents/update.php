<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data        = getJsonBody();
$id          = (int)($data['id'] ?? 0);
$titre       = trim($data['titre'] ?? '');
$description = trim($data['description'] ?? '');
$acces       = in_array($data['acces'] ?? '', ['tous', 'actifs']) ? $data['acces'] : 'actifs';
$categorie   = trim($data['categorie'] ?? '') ?: 'Général';

if (!$id || !$titre) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Titre requis']);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "UPDATE document SET titre = ?, description = ?, acces = ?, categorie = ? WHERE id = ?"
    );
    $stmt->execute([$titre, $description, $acces, $categorie, $id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('documents/update.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
