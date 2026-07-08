<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if (($auth['type'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs']);
    exit;
}

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
    $stmt = $pdo->prepare("SELECT image FROM projet WHERE id = ?");
    $stmt->execute([$id]);
    $img = $stmt->fetchColumn();

    $pdo->prepare("DELETE FROM projet WHERE id = ?")->execute([$id]);

    if ($img) {
        $uploadsDir = realpath(__DIR__ . '/../../uploads');
        $path       = realpath($uploadsDir . '/' . basename($img));
        if ($path && str_starts_with($path, $uploadsDir . DIRECTORY_SEPARATOR)) {
            @unlink($path);
        }
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('projets/supprimer.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
