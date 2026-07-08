<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

$page    = max(1, (int)($_GET['page']    ?? 1));
$limit   = min(50, max(1, (int)($_GET['limit']   ?? 20)));
$offset  = ($page - 1) * $limit;
$statut  = $_GET['statut'] ?? '';
$search  = trim($_GET['search'] ?? '');

$where  = '1=1';
$params = [];

if ($statut && in_array($statut, ['actif', 'en_attente', 'suspendu'])) {
    $where    .= ' AND statut = ?';
    $params[]  = $statut;
}
if ($search) {
    $like      = "%$search%";
    $where    .= ' AND (nom LIKE ? OR prenom LIKE ? OR code_producteur LIKE ?)';
    $params[]  = $like;
    $params[]  = $like;
    $params[]  = $like;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, code_producteur AS code, nom, prenom, email,
                telephone, localisation, section, statut, photo, created_at,
                tel_verifie
         FROM producteur
         WHERE $where
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?"
    );
    $stmt->execute([...$params, $limit, $offset]);
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
