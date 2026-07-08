<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

try {
    $pdo = getConnection();

    // ── Producteurs ──────────────────────────────────────────
    $producteurs = $pdo->query("
        SELECT
            p.id, p.code_producteur, p.nom, p.prenom,
            p.email, p.telephone, p.localisation, p.section,
            p.statut, p.created_at,
            COUNT(DISTINCT m.id) AS nb_messages,
            COUNT(DISTINCT t.id) AS nb_telechargements
        FROM producteur p
        LEFT JOIN message m  ON m.expediteur_id = p.id AND m.expediteur_type = 'producteur'
        LEFT JOIN telechargement t ON t.producteur_id = p.id
        GROUP BY p.id
        ORDER BY p.created_at DESC
    ")->fetchAll();

    // ── Documents les plus téléchargés ────────────────────────
    $documents = $pdo->query("
        SELECT
            d.id, d.titre, d.type_fichier, d.categorie, d.acces,
            d.created_at,
            COUNT(t.id) AS nb_telechargements
        FROM document d
        LEFT JOIN telechargement t ON t.document_id = d.id
        GROUP BY d.id
        ORDER BY nb_telechargements DESC, d.created_at DESC
        LIMIT 30
    ")->fetchAll();

    // ── Statistiques globales ─────────────────────────────────
    $stats = [
        'total_producteurs'      => (int)$pdo->query("SELECT COUNT(*) FROM producteur")->fetchColumn(),
        'producteurs_actifs'     => (int)$pdo->query("SELECT COUNT(*) FROM producteur WHERE statut='actif'")->fetchColumn(),
        'producteurs_en_attente' => (int)$pdo->query("SELECT COUNT(*) FROM producteur WHERE statut='en_attente'")->fetchColumn(),
        'total_documents'        => (int)$pdo->query("SELECT COUNT(*) FROM document")->fetchColumn(),
        'total_telechargements'  => (int)$pdo->query("SELECT COUNT(*) FROM telechargement")->fetchColumn(),
        'total_conversations'    => (int)$pdo->query("SELECT COUNT(*) FROM conversation")->fetchColumn(),
        'conversations_ouvertes' => (int)$pdo->query("SELECT COUNT(*) FROM conversation WHERE statut='ouverte'")->fetchColumn(),
        'annonces_publiees'      => (int)$pdo->query("SELECT COUNT(*) FROM annonce WHERE statut='publiee'")->fetchColumn(),
    ];

    // ── Téléchargements par mois (6 derniers mois) ───────────
    $telMensuels = $pdo->query("
        SELECT
            DATE_FORMAT(created_at, '%Y-%m') AS mois,
            COUNT(*) AS total
        FROM telechargement
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY mois
        ORDER BY mois ASC
    ")->fetchAll();

    echo json_encode([
        'stats'        => $stats,
        'producteurs'  => $producteurs,
        'documents'    => $documents,
        'tel_mensuels' => $telMensuels,
    ]);
} catch (PDOException $e) {
    error_log('rapports/index.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erreur serveur']);
}
