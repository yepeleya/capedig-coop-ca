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

$data    = getJsonBody();
$convId  = (int)($data['conversation_id'] ?? 0);
$contenu = trim($data['contenu'] ?? '');

if (!$convId || !$contenu) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données manquantes']);
    exit;
}

try {
    $pdo = getConnection();

    // Récupérer la conversation
    $stmtConv = $pdo->prepare("SELECT id, sujet, producteur_id, statut FROM conversation WHERE id = ?");
    $stmtConv->execute([$convId]);
    $conv = $stmtConv->fetch();

    if (!$conv) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Conversation introuvable']);
        exit;
    }
    if ($conv['statut'] === 'close') {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Cette conversation est clôturée']);
        exit;
    }

    // Producteur ne peut répondre qu'à sa propre conversation
    if ($auth['type'] === 'producteur' && (int)$conv['producteur_id'] !== (int)$auth['id']) {
        http_response_code(403);
        echo json_encode(['success' => false]);
        exit;
    }

    $expediteurType    = $auth['type'] === 'admin' ? 'admin' : 'producteur';
    $destinataireType  = $expediteurType === 'admin' ? 'producteur' : 'admin';
    $destinataireId    = $expediteurType === 'admin' ? (int)$conv['producteur_id'] : 1;

    // Insérer le message
    $pdo->prepare("
        INSERT INTO message
            (conversation_id, contenu, expediteur_type, expediteur_id,
             destinataire_type, destinataire_id, sujet)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ")->execute([
        $convId, $contenu,
        $expediteurType, $auth['id'],
        $destinataireType, $destinataireId,
        $conv['sujet'],
    ]);
    $msgId = (int)$pdo->lastInsertId();

    // Mettre à jour le timestamp de la conversation
    $pdo->prepare("UPDATE conversation SET updated_at = NOW() WHERE id = ?")
        ->execute([$convId]);

    // Notifier l'autre parti (notification interne + e-mail)
    $extrait = mb_substr(strip_tags($contenu), 0, 200);
    if ($expediteurType === 'admin') {
        creerNotification(
            $pdo, 'reponse',
            "L'administration a répondu : {$conv['sujet']}",
            '/producteur/dashboard',
            'producteur', (int)$conv['producteur_id']
        );
        // E-mail au producteur
        $q = $pdo->prepare("SELECT email, prenom FROM producteur WHERE id = ?");
        $q->execute([(int)$conv['producteur_id']]);
        if ($prd = $q->fetch()) {
            envoyerMail(
                $prd['email'],
                "Réponse de la coopérative — {$conv['sujet']}",
                "<p>Bonjour {$prd['prenom']},</p>
                 <p>L'administration de la CAPEDIG-COOP CA a répondu à votre
                    message « <strong>{$conv['sujet']}</strong> » :</p>
                 <blockquote style=\"border-left:3px solid #D4641A;margin:14px 0;
                    padding:10px 16px;background:#FAF7F0;border-radius:0 6px 6px 0;\">$extrait</blockquote>
                 <p>Vous pouvez consulter la conversation complète et y répondre
                    depuis votre espace personnel.</p>",
                'NOUVELLE RÉPONSE',
                ['label' => 'Voir la conversation', 'url' => siteUrl('/producteur/dashboard')]
            );
        }
    } else {
        $nomExp = trim(($auth['prenom'] ?? '') . ' ' . ($auth['nom'] ?? '')) ?: 'Un producteur';
        creerNotification($pdo, 'message', "Réponse de $nomExp dans : {$conv['sujet']}", '/admin/messages');
        // E-mail à l'admin
        $q = $pdo->prepare("SELECT email FROM admin ORDER BY id ASC LIMIT 1");
        $q->execute();
        if ($adm = $q->fetch()) {
            envoyerMail(
                $adm['email'],
                "Nouveau message producteur — {$conv['sujet']}",
                "<p><strong>$nomExp</strong> a répondu dans la conversation
                    « <strong>{$conv['sujet']}</strong> » :</p>
                 <blockquote style=\"border-left:3px solid #D4641A;margin:14px 0;
                    padding:10px 16px;background:#FAF7F0;border-radius:0 6px 6px 0;\">$extrait</blockquote>
                 <p>Merci de prendre connaissance de ce message dans les meilleurs délais.</p>",
                'NOUVEAU MESSAGE',
                ['label' => 'Répondre au message', 'url' => siteUrl('/admin/messages')]
            );
        }
    }

    echo json_encode(['success' => true, 'id' => $msgId]);
} catch (PDOException $e) {
    error_log('conversations/repondre.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
