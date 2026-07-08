<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, nom, prenom, email, role, statut, photo,
                DATE_FORMAT(created_at, '%b %Y') AS depuis
         FROM admin
         WHERE id != ?
         ORDER BY created_at ASC"
    );
    $stmt->execute([$auth['id']]);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $r['initiales'] = strtoupper(substr($r['prenom'] ?? '', 0, 1) . substr($r['nom'] ?? '', 0, 1));
    }
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
