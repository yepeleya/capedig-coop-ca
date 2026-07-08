<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

// Retourne les 10 dernières actions : inscriptions + annonces + messages
try {
    $pdo = getConnection();

    $items = [];

    // Dernières inscriptions
    $s = $pdo->query(
        "SELECT 'inscription' AS type,
                CONCAT('Nouveau producteur inscrit : ', prenom, ' ', nom, ' (', section, ')') AS text,
                TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago,
                CONCAT('Il y a ', TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' min') AS temps,
                '👤' AS icon, '#22C55E' AS color
         FROM producteur ORDER BY created_at DESC LIMIT 3"
    );
    foreach ($s->fetchAll() as $row) $items[] = $row;

    // Dernières annonces
    $s = $pdo->query(
        "SELECT 'annonce' AS type,
                CONCAT('Annonce publiée : ', titre) AS text,
                TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago,
                CONCAT('Il y a ', TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' min') AS temps,
                '📢' AS icon, '#D4641A' AS color
         FROM annonce WHERE statut = 'publiee' ORDER BY created_at DESC LIMIT 3"
    );
    foreach ($s->fetchAll() as $row) $items[] = $row;

    // Derniers messages
    $s = $pdo->query(
        "SELECT 'message' AS type,
                CONCAT('Nouveau message : ', sujet) AS text,
                TIMESTAMPDIFF(MINUTE, created_at, NOW()) AS minutes_ago,
                CONCAT('Il y a ', TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' min') AS temps,
                '✉️' AS icon, '#3B82F6' AS color
         FROM message WHERE destinataire_type = 'admin' ORDER BY created_at DESC LIMIT 4"
    );
    foreach ($s->fetchAll() as $row) $items[] = $row;

    // Trier par ancienneté réelle (minutes_ago croissant = plus récent en premier)
    usort($items, fn($a, $b) => $a['minutes_ago'] <=> $b['minutes_ago']);
    foreach ($items as &$row) unset($row['minutes_ago']);

    echo json_encode(array_slice($items, 0, 10));
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([]);
}
