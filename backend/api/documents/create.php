<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$titre       = trim($_POST['titre'] ?? '');
$description = trim($_POST['description'] ?? '');
$acces       = in_array($_POST['acces'] ?? '', ['tous', 'actifs']) ? $_POST['acces'] : 'actifs';
$categorie   = trim($_POST['categorie'] ?? '') ?: 'Général';

if (!$titre || empty($_FILES['fichier']['name'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Titre et fichier requis']);
    exit;
}

$AUTORISES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];
$original  = $_FILES['fichier']['name'];
$ext       = strtolower(pathinfo($original, PATHINFO_EXTENSION));

if (!in_array($ext, $AUTORISES, true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Type de fichier non autorisé']);
    exit;
}

$dir = __DIR__ . '/../../uploads/';
if (!is_dir($dir)) mkdir($dir, 0755, true);

$filename = 'doc_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;

if (!move_uploaded_file($_FILES['fichier']['tmp_name'], $dir . $filename)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Échec de l'upload"]);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "INSERT INTO document (titre, fichier, type_fichier, description, acces, categorie, admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$titre, $filename, $ext, $description, $acces, $categorie, $auth['id']]);
    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    error_log('documents/create.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
