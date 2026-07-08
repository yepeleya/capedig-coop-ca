<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

try {
    $pdo  = getConnection();
    $stmt = $pdo->query(
        "SELECT DATE_FORMAT(created_at, '%b') AS mois,
                COUNT(*) AS annonces,
                COUNT(*) * 85 AS vues
         FROM annonce
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
         GROUP BY YEAR(created_at), MONTH(created_at)
         ORDER BY created_at ASC
         LIMIT 6"
    );
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
