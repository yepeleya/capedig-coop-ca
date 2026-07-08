<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

// Filtre d'accès : producteurs voient seulement les docs 'actifs' ou 'tous'
$acces    = ($_GET['acces'] ?? 'actifs');
if (!in_array($acces, ['tous', 'actifs'])) $acces = 'actifs';
$categorie = trim($_GET['categorie'] ?? '');

try {
    $pdo  = getConnection();

    $where  = $acces === 'actifs' ? "acces IN ('tous', 'actifs')" : '1=1';
    $params = [];
    if ($categorie) {
        $where   .= ' AND categorie = ?';
        $params[] = $categorie;
    }

    $stmt = $pdo->prepare(
        "SELECT id, titre, fichier, type_fichier, description, acces, categorie, created_at
         FROM document
         WHERE $where
         ORDER BY created_at DESC"
    );
    $stmt->execute($params);

    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        // Calcul taille en lecture humaine
        $path = __DIR__ . '/../../uploads/' . $row['fichier'];
        if (file_exists($path)) {
            $bytes = filesize($path);
            $row['taille'] = $bytes > 1048576
                ? round($bytes / 1048576, 1) . ' MB'
                : round($bytes / 1024, 0) . ' KB';
        } else {
            $row['taille'] = '—';
        }
    }
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
