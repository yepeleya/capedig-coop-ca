<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

try {
    $pdo  = getConnection();
    $stmt = $pdo->query("SELECT nom, adresse, contact, agrement, site FROM config_coop WHERE id = 1");
    echo json_encode($stmt->fetch() ?: []);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
