<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($auth['type'] !== 'producteur') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès refusé']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$nom          = trim($_POST['nom']          ?? '');
$prenom       = trim($_POST['prenom']       ?? '');
$telephone    = trim($_POST['telephone']    ?? '');
$localisation = trim($_POST['localisation'] ?? '');

if (!$nom) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le nom est requis']);
    exit;
}

try {
    $pdo = getConnection();

    // Récupérer l'ancienne photo
    $ancienne = $pdo->prepare("SELECT photo FROM producteur WHERE id = ?");
    $ancienne->execute([$auth['id']]);
    $photoActuelle = $ancienne->fetchColumn();

    $photo = $photoActuelle; // conserver par défaut

    // Traitement nouvelle photo
    if (!empty($_FILES['photo']['name'])) {
        $AUTORISES = ['jpg', 'jpeg', 'png', 'webp'];
        $ext = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
        if (!in_array($ext, $AUTORISES, true)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Format photo non autorisé (jpg, png, webp)']);
            exit;
        }
        $dir = __DIR__ . '/../../uploads/';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $photo = 'profil_' . $auth['id'] . '_' . time() . '.' . $ext;
        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $dir . $photo)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => "Échec upload photo"]);
            exit;
        }
        // Supprimer l'ancienne photo si différente (path traversal check)
        if ($photoActuelle && $photoActuelle !== $photo) {
            $uploadsDir = realpath($dir);
            $oldPath    = realpath($uploadsDir . '/' . basename($photoActuelle));
            if ($oldPath && str_starts_with($oldPath, $uploadsDir . DIRECTORY_SEPARATOR)) {
                @unlink($oldPath);
            }
        }
    }

    // Supprimer photo si demandé
    if (isset($_POST['supprimer_photo']) && $_POST['supprimer_photo'] === '1') {
        if ($photoActuelle) {
            $uploadsDir = realpath(__DIR__ . '/../../uploads');
            $oldPath    = realpath($uploadsDir . '/' . basename($photoActuelle));
            if ($oldPath && str_starts_with($oldPath, $uploadsDir . DIRECTORY_SEPARATOR)) {
                @unlink($oldPath);
            }
        }
        $photo = null;
    }

    $pdo->prepare(
        "UPDATE producteur SET nom = ?, prenom = ?, telephone = ?, localisation = ?, photo = ?
         WHERE id = ?"
    )->execute([$nom, $prenom, $telephone, $localisation, $photo, $auth['id']]);

    $photoUrl = $photo ? '/uploads/' . $photo : null;
    echo json_encode(['success' => true, 'photo_url' => $photoUrl, 'photo' => $photo]);
} catch (PDOException $e) {
    error_log('producteurs/update_profil.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
