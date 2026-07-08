<?php
// Création (sans id) ou modification (avec id) d'un projet — admin uniquement
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if (($auth['type'] ?? '') !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Accès réservé aux administrateurs']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$id          = (int)($_POST['id'] ?? 0);
$titre       = trim($_POST['titre']       ?? '');
$description = trim($_POST['description'] ?? '');
$categorie   = in_array($_POST['categorie'] ?? '', ['agricole', 'social', 'environnemental'])
               ? $_POST['categorie'] : 'agricole';
$statut      = in_array($_POST['statut'] ?? '', ['planifie', 'en_cours', 'termine', 'nouveau', 'pilote'])
               ? $_POST['statut'] : 'planifie';
$dateDebut   = trim($_POST['date_debut'] ?? '') ?: null;
$dateFin     = trim($_POST['date_fin']   ?? '') ?: null;
$publication = in_array($_POST['publication'] ?? '', ['publiee', 'brouillon', 'programmee'])
               ? $_POST['publication'] : 'publiee';
$datePub     = trim($_POST['date_publication'] ?? '') ?: null;
$dateSup     = trim($_POST['date_suppression'] ?? '') ?: null;

if (!$titre || !$description) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Titre et description requis']);
    exit;
}

if ($publication === 'programmee' && !$datePub) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date de publication requise pour un projet programmé']);
    exit;
}

if (mb_strlen($titre) > 100) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le titre ne peut pas dépasser 100 caractères']);
    exit;
}

try {
    $pdo = getConnection();

    // Image actuelle (en cas de modification)
    $imageActuelle = null;
    if ($id) {
        $q = $pdo->prepare("SELECT image FROM projet WHERE id = ?");
        $q->execute([$id]);
        $imageActuelle = $q->fetchColumn() ?: null;
    }

    $image = $imageActuelle;

    // Upload nouvelle image
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
        $image = 'projet_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $dir . $image)) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => "Échec de l'upload de l'image"]);
            exit;
        }
        // Supprime l'ancienne image (path traversal check)
        if ($imageActuelle) {
            $uploadsDir = realpath($dir);
            $oldPath    = realpath($uploadsDir . '/' . basename($imageActuelle));
            if ($oldPath && str_starts_with($oldPath, $uploadsDir . DIRECTORY_SEPARATOR)) {
                @unlink($oldPath);
            }
        }
    }

    // Retrait d'image demandé
    if (isset($_POST['supprimer_image']) && $_POST['supprimer_image'] === '1') {
        if ($imageActuelle) {
            $uploadsDir = realpath(__DIR__ . '/../../uploads');
            $oldPath    = realpath($uploadsDir . '/' . basename($imageActuelle));
            if ($oldPath && str_starts_with($oldPath, $uploadsDir . DIRECTORY_SEPARATOR)) {
                @unlink($oldPath);
            }
        }
        $image = null;
    }

    if ($id) {
        $pdo->prepare(
            "UPDATE projet SET titre = ?, description = ?, image = ?, categorie = ?,
                    statut = ?, date_debut = ?, date_fin = ?,
                    publication = ?, date_publication = ?, date_suppression = ?
             WHERE id = ?"
        )->execute([$titre, $description, $image, $categorie, $statut, $dateDebut, $dateFin,
                     $publication, $datePub, $dateSup, $id]);
    } else {
        $pdo->prepare(
            "INSERT INTO projet (titre, description, image, categorie, statut, date_debut, date_fin,
                                  publication, date_publication, date_suppression)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        )->execute([$titre, $description, $image, $categorie, $statut, $dateDebut, $dateFin,
                     $publication, $datePub, $dateSup]);
        $id = (int)$pdo->lastInsertId();
    }

    echo json_encode(['success' => true, 'id' => $id]);
} catch (PDOException $e) {
    error_log('projets/save.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
