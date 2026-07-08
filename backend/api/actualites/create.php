<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../_helpers.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$titre     = trim($_POST['titre']     ?? '');
$contenu   = trim($_POST['contenu']   ?? '');
$categorie = trim($_POST['categorie'] ?? '') ?: null;
$statut    = in_array($_POST['statut'] ?? '', ['publiee', 'brouillon', 'programmee'])
             ? $_POST['statut'] : 'brouillon';
$datePub   = trim($_POST['date_publication'] ?? '') ?: null;
$dateSup   = trim($_POST['date_suppression'] ?? '') ?: null;

if ($statut === 'programmee' && !$datePub) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date de publication requise pour une actualité programmée']);
    exit;
}

if (!$titre || !$contenu) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Titre et contenu requis']);
    exit;
}

if (mb_strlen($titre) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le titre ne peut pas dépasser 100 caractères']);
    exit;
}

if (mb_strlen($contenu) > 60000) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le contenu est trop long']);
    exit;
}

$image = null;
if (!empty($_FILES['media']['name'])) {
    $AUTORISES = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm', 'mov'];
    $ext = strtolower(pathinfo($_FILES['media']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $AUTORISES, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Formats acceptés : jpg, png, webp, mp4, webm, mov']);
        exit;
    }
    if ($_FILES['media']['size'] > 20 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Fichier trop volumineux (max 20 Mo)']);
        exit;
    }
    $dir = __DIR__ . '/../../uploads/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $image = 'actualite_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES['media']['tmp_name'], $dir . $image)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Échec de l'upload du média"]);
        exit;
    }
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "INSERT INTO actualite
            (titre, contenu, image, categorie, statut, date_publication, date_suppression, admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$titre, $contenu, $image, $categorie, $statut, $datePub, $dateSup, $auth['id']]);

    if ($statut === 'publiee') {
        creerNotification($pdo, 'actualite', "Actualité publiée : $titre", '/admin/actualites');
    }

    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    error_log('actualites/create.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
