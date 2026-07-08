<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

try {
    $pdo  = getConnection();
    $stmt = $pdo->query(
        "SELECT COALESCE(section, 'Non assigné') AS name, COUNT(*) AS value
         FROM producteur
         WHERE statut = 'actif'
         GROUP BY section
         ORDER BY value DESC
         LIMIT 6"
    );
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
