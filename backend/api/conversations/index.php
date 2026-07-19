<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

$isAdmin = $auth['type'] === 'admin';
$limit   = min(50, max(1, (int)($_GET['limit'] ?? 30)));

try {
    $pdo = getConnection();

    // Sous-requêtes communes aux deux profils — factorisées pour éviter la
    // duplication entre la branche admin et la branche producteur.
    $dernierMessageSql = "
                (SELECT m2.contenu
                 FROM message m2
                 WHERE m2.conversation_id = c.id
                 ORDER BY m2.created_at DESC LIMIT 1) AS dernier_message,
                (SELECT m2.audio
                 FROM message m2
                 WHERE m2.conversation_id = c.id
                 ORDER BY m2.created_at DESC LIMIT 1) AS dernier_audio,
                (SELECT m3.expediteur_type
                 FROM message m3
                 WHERE m3.conversation_id = c.id
                 ORDER BY m3.created_at DESC LIMIT 1) AS dernier_expediteur";

    if ($isAdmin) {
        $stmt = $pdo->prepare("
            SELECT
                c.id, c.sujet, c.statut, c.prioritaire, c.updated_at, c.created_at,
                p.nom          AS prd_nom,
                p.prenom       AS prd_prenom,
                p.code_producteur AS prd_code,
                (SELECT COUNT(*)
                 FROM message m
                 WHERE m.conversation_id = c.id
                   AND m.lu = 0
                   AND m.expediteur_type = 'producteur') AS non_lus,
                $dernierMessageSql
            FROM conversation c
            JOIN producteur p ON c.producteur_id = p.id
            ORDER BY c.updated_at DESC
            LIMIT ?
        ");
        $stmt->execute([$limit]);
    } else {
        $stmt = $pdo->prepare("
            SELECT
                c.id, c.sujet, c.statut, c.prioritaire, c.updated_at, c.created_at,
                (SELECT COUNT(*)
                 FROM message m
                 WHERE m.conversation_id = c.id
                   AND m.lu = 0
                   AND m.expediteur_type = 'admin') AS non_lus,
                $dernierMessageSql
            FROM conversation c
            WHERE c.producteur_id = ?
            ORDER BY c.updated_at DESC
            LIMIT ?
        ");
        $stmt->execute([$auth['id'], $limit]);
    }

    $conversations = $stmt->fetchAll();

    foreach ($conversations as &$c) {
        $c['non_lus'] = (int)$c['non_lus'];
        if (!empty($c['dernier_audio'])) {
            $c['dernier_message'] = '🎤 Note vocale';
        } else {
            $c['dernier_message'] = mb_substr(strip_tags($c['dernier_message'] ?? ''), 0, 80);
            if ($c['dernier_message'] && mb_strlen($c['dernier_message']) >= 80) {
                $c['dernier_message'] .= '…';
            }
        }
        unset($c['dernier_audio']);
    }

    echo json_encode($conversations);
} catch (PDOException $e) {
    error_log('conversations/index.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([]);
}
