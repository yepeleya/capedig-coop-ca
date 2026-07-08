<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405); exit;
}

$id = (int)($_GET['id'] ?? 0);
if (!$id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID manquant']);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("SELECT fichier FROM document WHERE id = ?");
    $stmt->execute([$id]);
    $doc = $stmt->fetch();

    $pdo->prepare("DELETE FROM document WHERE id = ?")->execute([$id]);

    if ($doc && !empty($doc['fichier'])) {
        // Sécurité : s'assurer que le fichier résolu est bien dans le dossier uploads
        $uploadsDir = realpath(__DIR__ . '/../../uploads');
        $path       = realpath($uploadsDir . '/' . basename($doc['fichier']));
        if ($path && str_starts_with($path, $uploadsDir . DIRECTORY_SEPARATOR)) {
            unlink($path);
        }
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
