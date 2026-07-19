<?php
// Envoi d'une note vocale dans une conversation — admin ou producteur.
// Reprend les mêmes règles d'accès que conversations/repondre.php.
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

$convId = (int)($_POST['conversation_id'] ?? 0);

if (!$convId || empty($_FILES['audio']['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Conversation et fichier audio requis']);
    exit;
}

// 5 Mo max pour une note vocale (largement suffisant, quelques minutes d'audio compressé)
if ($_FILES['audio']['size'] > 5 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Note vocale trop volumineuse (max 5 Mo)']);
    exit;
}

$AUTORISES = ['webm', 'ogg', 'mp3', 'wav', 'm4a'];
$ext = strtolower(pathinfo($_FILES['audio']['name'], PATHINFO_EXTENSION));
if (!in_array($ext, $AUTORISES, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Format audio non supporté']);
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
    // Producteur ne peut envoyer que dans sa propre conversation
    if ($auth['type'] === 'producteur' && (int)$conv['producteur_id'] !== (int)$auth['id']) {
        http_response_code(403);
        echo json_encode(['success' => false]);
        exit;
    }

    // Upload du fichier
    $dir = __DIR__ . '/../../uploads/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $filename = 'audio_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES['audio']['tmp_name'], $dir . $filename)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Échec de l'enregistrement de la note vocale"]);
        exit;
    }

    $expediteurType   = $auth['type'] === 'admin' ? 'admin' : 'producteur';
    $destinataireType = $expediteurType === 'admin' ? 'producteur' : 'admin';
    $destinataireId   = $expediteurType === 'admin' ? (int)$conv['producteur_id'] : 1;

    $stmt = $pdo->prepare("
        INSERT INTO message
            (conversation_id, contenu, audio, expediteur_type, expediteur_id,
             destinataire_type, destinataire_id, sujet)
        VALUES (?, NULL, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $convId, $filename,
        $expediteurType, $auth['id'],
        $destinataireType, $destinataireId,
        $conv['sujet'],
    ]);
    $msgId = (int)$pdo->lastInsertId();

    $pdo->prepare("UPDATE conversation SET updated_at = NOW() WHERE id = ?")->execute([$convId]);

    // Notifications (interne + e-mail), même logique que pour un message texte
    if ($expediteurType === 'admin') {
        creerNotification(
            $pdo, 'reponse',
            "L'administration a envoyé une note vocale : {$conv['sujet']}",
            '/producteur/dashboard',
            'producteur', (int)$conv['producteur_id']
        );
        $q = $pdo->prepare("SELECT email, prenom FROM producteur WHERE id = ?");
        $q->execute([(int)$conv['producteur_id']]);
        if ($prd = $q->fetch()) {
            envoyerMail(
                $prd['email'],
                "Note vocale de la coopérative — {$conv['sujet']}",
                "<p>Bonjour {$prd['prenom']},</p>
                 <p>L'administration de la CAPEDIG-COOP CA vous a envoyé une note
                    vocale dans la conversation « <strong>{$conv['sujet']}</strong> ».</p>
                 <p>Connectez-vous à votre espace producteur pour l'écouter.</p>",
                'NOTE VOCALE',
                ['label' => 'Écouter le message', 'url' => siteUrl('/producteur/dashboard')]
            );
        }
    } else {
        $nomExp = trim(($auth['prenom'] ?? '') . ' ' . ($auth['nom'] ?? '')) ?: 'Un producteur';
        creerNotification($pdo, 'message', "Note vocale de $nomExp dans : {$conv['sujet']}", '/admin/messages');
        notifierTousLesAdmins(
            $pdo,
            "Note vocale producteur — {$conv['sujet']}",
            "<p><strong>$nomExp</strong> a envoyé une note vocale dans la
                conversation « <strong>{$conv['sujet']}</strong> ».</p>
             <p>Rendez-vous dans le back-office pour l'écouter.</p>",
            'NOTE VOCALE',
            ['label' => 'Écouter le message', 'url' => siteUrl('/admin/messages')]
        );
    }

    echo json_encode([
        'success' => true,
        'id'      => $msgId,
        'audio'   => $filename,
    ]);
} catch (PDOException $e) {
    error_log('conversations/envoyer_audio.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
