<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$id        = (int)($_POST['id'] ?? 0);
$titre     = trim($_POST['titre']     ?? '');
$contenu   = trim($_POST['contenu']   ?? '');
$categorie = trim($_POST['categorie'] ?? 'cooperative');
$statut    = in_array($_POST['statut'] ?? '', ['publiee', 'brouillon', 'programmee'])
             ? $_POST['statut'] : 'brouillon';
$datePub   = trim($_POST['date_publication'] ?? '') ?: null;
$dateSup   = trim($_POST['date_suppression'] ?? '') ?: null;
// Image existante à conserver si aucun nouveau fichier n'est envoyé,
// ou chaîne vide si l'admin a explicitement retiré l'image.
$imageActuelle = trim($_POST['image_actuelle'] ?? '') ?: null;

if (!$id || !$titre || !$contenu) {
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

$image = $imageActuelle;
if (!empty($_FILES['image']['name'])) {
    $AUTORISES = ['jpg', 'jpeg', 'png', 'webp'];
    $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $AUTORISES, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Image : formats acceptés jpg, png, webp']);
        exit;
    }
    $dir = __DIR__ . '/../../uploads/';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    $nouvelleImage = 'annonce_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $dir . $nouvelleImage)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Échec de l'upload de l'image"]);
        exit;
    }
    $image = $nouvelleImage;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "UPDATE annonce
         SET titre = ?, contenu = ?, image = ?, categorie = ?, statut = ?,
             date_publication = ?, date_suppression = ?
         WHERE id = ?"
    );
    $stmt->execute([$titre, $contenu, $image, $categorie, $statut, $datePub, $dateSup, $id]);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    error_log('annonces/update.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
