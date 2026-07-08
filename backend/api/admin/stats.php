<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth(); // tout admin connecté

try {
    $pdo = getConnection();

    $stats = [
        'total_producteurs' => (int)$pdo->query(
            "SELECT COUNT(*) FROM producteur")->fetchColumn(),
        'en_attente'        => (int)$pdo->query(
            "SELECT COUNT(*) FROM producteur WHERE statut = 'en_attente'")->fetchColumn(),
        'annonces_publiees' => (int)$pdo->query(
            "SELECT COUNT(*) FROM annonce WHERE statut = 'publiee'")->fetchColumn(),
        'messages_non_lus'  => (int)$pdo->query(
            "SELECT COUNT(*) FROM message
             WHERE lu = 0 AND expediteur_type = 'producteur'
               AND conversation_id IS NOT NULL")->fetchColumn(),
    ];

    // ── Évolution des inscriptions (6 derniers mois, y compris les mois à 0) ──
    $MOIS_FR = ['01'=>'Jan','02'=>'Fév','03'=>'Mar','04'=>'Avr','05'=>'Mai','06'=>'Juin',
                '07'=>'Juil','08'=>'Août','09'=>'Sep','10'=>'Oct','11'=>'Nov','12'=>'Déc'];
    $parMois = $pdo->query(
        "SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, COUNT(*) AS total
         FROM producteur
         WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY ym"
    )->fetchAll(PDO::FETCH_KEY_PAIR);

    $inscriptions = [];
    for ($i = 5; $i >= 0; $i--) {
        $ym = date('Y-m', strtotime("-$i months"));
        $inscriptions[] = [
            'mois'  => $MOIS_FR[substr($ym, 5, 2)],
            'total' => (int)($parMois[$ym] ?? 0),
        ];
    }
    $stats['inscriptions'] = $inscriptions;

    // ── Distribution par région (top 5 localisations) ──────────
    $regions = $pdo->query(
        "SELECT COALESCE(NULLIF(TRIM(localisation), ''), 'Non renseigné') AS name, COUNT(*) AS value
         FROM producteur
         GROUP BY name
         ORDER BY value DESC
         LIMIT 5"
    )->fetchAll();
    $stats['regions'] = $regions;

    // ── Activité récente (dernières notifications admin) ───────
    $activites = $pdo->query(
        "SELECT message AS texte, created_at
         FROM notification
         WHERE destinataire_type = 'admin'
         ORDER BY created_at DESC
         LIMIT 6"
    )->fetchAll();
    $stats['activites'] = $activites;

    echo json_encode($stats);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur']);
}
