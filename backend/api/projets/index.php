<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();

// Public : liste des projets publiés. Admin (?admin) : auth requise, voit tout.
$isAdmin = isset($_GET['admin']);
if ($isAdmin) requireAuth();

$limit = min(50, max(1, (int)($_GET['limit'] ?? 30)));

try {
    $pdo = getConnection();

    // Toujours : publie les projets programmés dont la date est passée
    // + purge ceux dont la date de suppression est dépassée.
    $pdo->exec("UPDATE projet SET publication = 'publiee' WHERE publication = 'programmee' AND date_publication IS NOT NULL AND date_publication <= NOW()");
    $pdo->exec("DELETE FROM projet WHERE date_suppression IS NOT NULL AND date_suppression <= NOW()");

    if ($isAdmin) {
        $stmt = $pdo->prepare(
            "SELECT id, titre, description, image, categorie, statut, publication,
                    DATE_FORMAT(date_debut, '%Y-%m-%d') AS date_debut,
                    DATE_FORMAT(date_fin,   '%Y-%m-%d') AS date_fin,
                    DATE_FORMAT(date_publication, '%Y-%m-%dT%H:%i') AS date_publication,
                    DATE_FORMAT(date_suppression, '%Y-%m-%dT%H:%i') AS date_suppression,
                    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
             FROM projet
             ORDER BY created_at DESC
             LIMIT ?"
        );
    } else {
        $stmt = $pdo->prepare(
            "SELECT id, titre, description, image, categorie, statut,
                    DATE_FORMAT(date_debut, '%Y-%m-%d') AS date_debut,
                    DATE_FORMAT(date_fin,   '%Y-%m-%d') AS date_fin,
                    DATE_FORMAT(created_at, '%Y-%m-%d') AS created_at
             FROM projet
             WHERE publication = 'publiee'
               AND (date_suppression IS NULL OR date_suppression > NOW())
             ORDER BY created_at DESC
             LIMIT ?"
        );
    }
    $stmt->execute([$limit]);
    echo json_encode($stmt->fetchAll());
} catch (PDOException $e) {
    error_log('projets/index.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([]);
}
