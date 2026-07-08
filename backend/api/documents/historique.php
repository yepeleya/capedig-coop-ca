<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($auth['type'] !== 'producteur') {
    http_response_code(403);
    echo json_encode([]);
    exit;
}

$limit = min(50, max(1, (int)($_GET['limit'] ?? 30)));

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("
        SELECT
            t.id           AS telechargement_id,
            t.created_at   AS date_telechargement,
            d.id           AS document_id,
            d.titre,
            d.type_fichier,
            d.categorie,
            d.fichier
        FROM telechargement t
        JOIN document d ON t.document_id = d.id
        WHERE t.producteur_id = ?
        ORDER BY t.created_at DESC
        LIMIT ?
    ");
    $stmt->execute([$auth['id'], $limit]);
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    error_log('documents/historique.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([]);
}
