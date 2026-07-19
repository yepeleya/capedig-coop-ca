<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

$convId = (int)($_GET['id'] ?? 0);
if (!$convId) {
    http_response_code(400);
    echo json_encode(['conversation' => null, 'messages' => []]);
    exit;
}

try {
    $pdo = getConnection();

    // Vérification d'accès : producteur ne peut voir que ses propres conversations
    if ($auth['type'] !== 'admin') {
        $check = $pdo->prepare("SELECT id FROM conversation WHERE id = ? AND producteur_id = ?");
        $check->execute([$convId, $auth['id']]);
        if (!$check->fetch()) {
            http_response_code(403);
            echo json_encode(['conversation' => null, 'messages' => []]);
            exit;
        }
    }

    // Récupérer la conversation + infos producteur
    $stmtConv = $pdo->prepare("
        SELECT c.id, c.sujet, c.statut, c.prioritaire, c.created_at, c.updated_at,
               p.nom AS prd_nom, p.prenom AS prd_prenom, p.code_producteur AS prd_code,
               p.id AS prd_id
        FROM conversation c
        JOIN producteur p ON c.producteur_id = p.id
        WHERE c.id = ?
    ");
    $stmtConv->execute([$convId]);
    $conv = $stmtConv->fetch();

    if (!$conv) {
        http_response_code(404);
        echo json_encode(['conversation' => null, 'messages' => []]);
        exit;
    }

    // Récupérer tous les messages du fil
    $stmtMsgs = $pdo->prepare("
        SELECT id, contenu, audio, expediteur_type, lu, created_at
        FROM message
        WHERE conversation_id = ?
        ORDER BY created_at ASC
    ");
    $stmtMsgs->execute([$convId]);
    $messages = $stmtMsgs->fetchAll();

    // Marquer comme lus les messages de l'autre parti
    $recipientType = $auth['type'] === 'admin' ? 'producteur' : 'admin';
    $pdo->prepare("
        UPDATE message SET lu = 1
        WHERE conversation_id = ? AND expediteur_type = ? AND lu = 0
    ")->execute([$convId, $recipientType]);

    // Les notifications de type message/réponse sont indépendantes des messages
    // eux-mêmes (table à part) : les marquer aussi comme lues ici, sinon la
    // cloche de notification reste bloquée même après lecture de la conversation.
    $notifType       = $auth['type'] === 'producteur' ? 'producteur' : 'admin';
    $notifDestinatId = $notifType === 'producteur' ? $auth['id'] : 1;
    $pdo->prepare("
        UPDATE notification SET lu = 1
        WHERE destinataire_type = ? AND destinataire_id = ?
          AND type IN ('message', 'reponse') AND lu = 0
    ")->execute([$notifType, $notifDestinatId]);

    echo json_encode(['conversation' => $conv, 'messages' => $messages]);
} catch (PDOException $e) {
    error_log('conversations/messages.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['conversation' => null, 'messages' => []]);
}
