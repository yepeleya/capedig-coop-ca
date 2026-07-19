<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../_helpers.php';
require_once __DIR__ . '/../../config/mailer.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

if ($auth['type'] !== 'producteur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Seul un producteur peut initier une conversation']);
    exit;
}

$data    = getJsonBody();
$sujet   = trim($data['sujet']   ?? '');
$contenu = trim($data['contenu'] ?? '');

if (!$sujet || !$contenu) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Sujet et message requis']);
    exit;
}

if (mb_strlen($sujet) > 120) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le sujet ne peut pas dépasser 120 caractères']);
    exit;
}

try {
    $pdo = getConnection();
    $pdo->beginTransaction();

    // Créer la conversation
    $pdo->prepare("INSERT INTO conversation (sujet, producteur_id) VALUES (?, ?)")
        ->execute([$sujet, $auth['id']]);
    $convId = (int)$pdo->lastInsertId();

    // Insérer le premier message
    $pdo->prepare("
        INSERT INTO message
            (conversation_id, contenu, expediteur_type, expediteur_id,
             destinataire_type, destinataire_id, sujet)
        VALUES (?, ?, 'producteur', ?, 'admin', 1, ?)
    ")->execute([$convId, $contenu, $auth['id'], $sujet]);

    $pdo->commit();

    // Notifier l'admin (notification interne + e-mail)
    $nomExp = trim(($auth['prenom'] ?? '') . ' ' . ($auth['nom'] ?? '')) ?: 'Un producteur';
    creerNotification($pdo, 'message', "Nouveau message de $nomExp : $sujet", '/admin/messages');

    $extrait = mb_substr(strip_tags($contenu), 0, 200);
    notifierTousLesAdmins(
        $pdo,
        "Nouvelle conversation — $sujet",
        "<p><strong>$nomExp</strong> a démarré une nouvelle conversation avec
            l'administration :</p>
         <p><strong>Sujet :</strong> $sujet</p>
         <blockquote style=\"border-left:3px solid #D4641A;margin:14px 0;
            padding:10px 16px;background:#FAF7F0;border-radius:0 6px 6px 0;\">$extrait</blockquote>
         <p>Merci de prendre connaissance de ce message dans les meilleurs délais.</p>",
        'NOUVEAU MESSAGE',
        ['label' => 'Répondre au message', 'url' => siteUrl('/admin/messages')]
    );

    echo json_encode(['success' => true, 'conversation_id' => $convId]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('conversations/creer.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
