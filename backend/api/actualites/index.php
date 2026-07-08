<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();

// Admin voit tout (avec auth), public voit seulement les publiées non expirées
$isAdmin = isset($_GET['admin']);
if ($isAdmin) requireAuth();

$limit = min(50, max(1, (int)($_GET['limit'] ?? 20)));

try {
    $pdo = getConnection();

    // Toujours : publie les programmées dont la date est passée + purge les expirées
    $pdo->exec("UPDATE actualite SET statut = 'publiee' WHERE statut = 'programmee' AND date_publication IS NOT NULL AND date_publication <= NOW()");
    $pdo->exec("DELETE FROM actualite WHERE date_suppression IS NOT NULL AND date_suppression <= NOW()");

    if ($isAdmin) {
        $stmt = $pdo->prepare(
            "SELECT id, titre, contenu, image, categorie, statut,
                    DATE_FORMAT(date_publication, '%Y-%m-%dT%H:%i') AS date_publication,
                    DATE_FORMAT(date_suppression, '%Y-%m-%dT%H:%i') AS date_suppression,
                    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
             FROM actualite
             ORDER BY created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$limit]);
    } else {
        $id = (int)($_GET['id'] ?? 0);
        $where = "statut = 'publiee' AND (date_suppression IS NULL OR date_suppression > NOW())";
        $params = [];
        if ($id) {
            $where .= ' AND id = ?';
            $params[] = $id;
        }
        $stmt = $pdo->prepare(
            "SELECT id, titre, contenu, image, categorie,
                    DATE_FORMAT(created_at, '%d %b %Y') AS date,
                    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
             FROM actualite
             WHERE $where
             ORDER BY created_at DESC
             LIMIT ?"
        );
        $stmt->execute([...$params, $id ? 1 : $limit]);
    }

    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
