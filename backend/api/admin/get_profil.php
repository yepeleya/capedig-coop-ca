<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, nom, prenom, email, tel_admin AS telephone, photo, role
         FROM admin WHERE id = ? LIMIT 1"
    );
    $stmt->execute([$auth['id']]);
    $row = $stmt->fetch();

    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Introuvable']);
        exit;
    }
    echo json_encode($row);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur']);
}
