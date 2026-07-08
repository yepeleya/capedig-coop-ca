<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data       = getJsonBody();
$documentId = (int)($data['document_id'] ?? 0);

if (!$documentId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'document_id requis']);
    exit;
}

try {
    $pdo = getConnection();

    // Vérifier que le document existe et est accessible
    $stmt = $pdo->prepare("SELECT id, titre, fichier, acces FROM document WHERE id = ?");
    $stmt->execute([$documentId]);
    $doc = $stmt->fetch();

    if (!$doc) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Document introuvable']);
        exit;
    }

    // Enregistrer le téléchargement si c'est un producteur
    if ($auth['type'] === 'producteur') {
        $pdo->prepare(
            "INSERT INTO telechargement (document_id, producteur_id) VALUES (?, ?)"
        )->execute([$documentId, $auth['id']]);
    }

    echo json_encode([
        'success' => true,
        'url'     => '/uploads/' . $doc['fichier'],
        'titre'   => $doc['titre'],
    ]);
} catch (PDOException $e) {
    error_log('documents/telecharger.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
