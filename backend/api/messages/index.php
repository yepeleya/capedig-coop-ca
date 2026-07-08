<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

$isAdmin      = $auth['type'] === 'admin';
$producteurId = (int)($_GET['producteur_id'] ?? $auth['id']);
$nonLus       = isset($_GET['non_lus']);
$limit        = min(50, max(1, (int)($_GET['limit'] ?? 30)));

try {
    $pdo = getConnection();

    if ($isAdmin) {
        // Admin voit tous les messages entrants
        $where  = "destinataire_type = 'admin'";
        $params = [];
        if ($nonLus) { $where .= " AND lu = 0"; }
        $stmt = $pdo->prepare(
            "SELECT m.id, m.sujet, m.contenu, m.lu, m.reponse, m.prioritaire, m.resolu, m.created_at,
                    p.nom AS exp_nom, p.prenom AS exp_prenom,
                    p.code_producteur AS prd_id
             FROM message m
             LEFT JOIN producteur p ON m.expediteur_id = p.id AND m.expediteur_type = 'producteur'
             WHERE $where
             ORDER BY m.created_at DESC
             LIMIT ?"
        );
        $params[] = $limit;
        $stmt->execute($params);
    } else {
        // Producteur voit ses propres messages
        $stmt = $pdo->prepare(
            "SELECT id, sujet, contenu, lu, reponse, resolu, created_at
             FROM message
             WHERE expediteur_id = ? AND expediteur_type = 'producteur'
             ORDER BY created_at DESC
             LIMIT ?"
        );
        $stmt->execute([$producteurId, $limit]);
    }

    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        if ($isAdmin) {
            $row['expediteur'] = trim(($row['exp_prenom'] ?? '') . ' ' . ($row['exp_nom'] ?? ''));
            $row['extrait']    = mb_substr($row['contenu'], 0, 120) . '...';
            $row['corps']      = $row['contenu'];
            $dt = new DateTime($row['created_at']);
            $diff = time() - $dt->getTimestamp();
            $row['heure'] = $diff < 3600
                ? round($diff/60) . ' min'
                : ($diff < 86400 ? $dt->format('H:i') : 'HIER');
        } else {
            $row['statut']  = $row['resolu'] ? 'RÉSOLU' : ($row['reponse'] ? 'RÉPONDU' : ($row['lu'] ? 'LU' : 'EN ATTENTE'));
            $row['extrait'] = mb_substr($row['contenu'], 0, 100) . '...';
        }
    }
    echo json_encode($rows);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
