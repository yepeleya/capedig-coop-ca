<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();

// Endpoint public si statut=publiee, sinon auth requise
$isAdmin = isset($_GET['admin']);
$isPublic = ($_GET['statut'] ?? '') === 'publiee' && !$isAdmin;
if (!$isPublic) requireAuth();

// Visiteur connecté (producteur/admin avec token valide) ou anonyme ?
// Les anonymes ne voient que les annonces de catégorie "formation".
$token       = getTokenFromHeader();
$isConnected = $token && verifyToken($token) !== null;

$limit  = min(50, max(1, (int)($_GET['limit'] ?? 20)));

try {
    $pdo = getConnection();

    // Toujours : publie les programmées dont la date est passée + purge les expirées
    $pdo->exec("UPDATE annonce SET statut = 'publiee' WHERE statut = 'programmee' AND date_publication IS NOT NULL AND date_publication <= NOW()");
    $pdo->exec("DELETE FROM annonce WHERE date_suppression IS NOT NULL AND date_suppression <= NOW()");

    if ($isAdmin) {
        $stmt = $pdo->prepare(
            "SELECT a.id, a.titre, a.contenu, a.image, a.statut, a.categorie,
                    a.created_at,
                    DATE_FORMAT(a.date_publication, '%Y-%m-%dT%H:%i') AS date_publication,
                    DATE_FORMAT(a.date_suppression, '%Y-%m-%dT%H:%i') AS date_suppression,
                    CONCAT(ad.prenom, ' ', ad.nom) AS auteur
             FROM annonce a
             LEFT JOIN admin ad ON a.admin_id = ad.id
             ORDER BY a.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$limit]);
    } else {
        $statut = trim($_GET['statut'] ?? '');
        $id     = (int)($_GET['id'] ?? 0);
        $params = [];
        $where  = '1=1';
        if ($statut && in_array($statut, ['publiee', 'brouillon'])) {
            $where   .= ' AND a.statut = ?';
            $params[] = $statut;
        }
        if ($id) {
            $where   .= ' AND a.id = ?';
            $params[] = $id;
        }
        // Public anonyme : seules les annonces "formation" sont visibles
        if (!$isConnected) {
            $where .= " AND a.categorie = 'formation'";
        }
        $stmt = $pdo->prepare(
            "SELECT a.id, a.titre, a.contenu, a.image, a.statut,
                    a.created_at, a.categorie,
                    CONCAT(ad.prenom, ' ', ad.nom) AS auteur
             FROM annonce a
             LEFT JOIN admin ad ON a.admin_id = ad.id
             WHERE $where
               AND (a.date_suppression IS NULL OR a.date_suppression > NOW())
             ORDER BY a.created_at DESC
             LIMIT ?"
        );
        $stmt->execute([...$params, $id ? 1 : $limit]);
    }

    $rows = $stmt->fetchAll();

    foreach ($rows as &$row) {
        $dt           = new DateTime($row['created_at']);
        $row['date']  = $dt->format('d M Y');
        $row['heure'] = $dt->format('H:i');
    }

    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
