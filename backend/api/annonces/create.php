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

$titre     = trim($_POST['titre']     ?? '');
$contenu   = trim($_POST['contenu']   ?? '');
$categorie = trim($_POST['categorie'] ?? 'cooperative');
$statut    = in_array($_POST['statut'] ?? '', ['publiee', 'brouillon', 'programmee'])
             ? $_POST['statut'] : 'brouillon';
$datePub   = trim($_POST['date_publication'] ?? '') ?: null;
$dateSup   = trim($_POST['date_suppression'] ?? '') ?: null;

if ($statut === 'programmee' && !$datePub) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date de publication requise pour une annonce programmée']);
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
    $image = 'annonce_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $dir . $image)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Échec de l'upload de l'image"]);
        exit;
    }
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "INSERT INTO annonce (titre, contenu, image, categorie, statut, date_publication, date_suppression, admin_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([$titre, $contenu, $image, $categorie, $statut, $datePub, $dateSup, $auth['id']]);

    if ($statut === 'publiee') {
        creerNotification($pdo, 'annonce', "Annonce publiée : $titre", '/admin/annonces');

        // E-mail à tous les producteurs actifs
        $extrait = mb_substr(strip_tags($contenu), 0, 200);
        $prds = $pdo->query(
            "SELECT email, prenom FROM producteur WHERE statut = 'actif' AND email IS NOT NULL"
        )->fetchAll();
        foreach ($prds as $prd) {
            envoyerMail(
                $prd['email'],
                "Nouvelle annonce — $titre",
                "<p>Bonjour {$prd['prenom']},</p>
                 <p>Une nouvelle annonce vient d'être publiée par la
                    <strong>CAPEDIG-COOP CA</strong> :</p>
                 <p style=\"font-size:15.5px;font-weight:bold;color:#1F2937;margin:14px 0 4px;\">$titre</p>
                 <blockquote style=\"border-left:3px solid #D4641A;margin:8px 0 14px;
                    padding:10px 16px;background:#FAF7F0;border-radius:0 6px 6px 0;\">$extrait…</blockquote>
                 <p>Retrouvez l'annonce complète depuis votre espace producteur.</p>",
                'NOUVELLE ANNONCE',
                ['label' => 'Lire l\'annonce complète', 'url' => siteUrl('/producteur/dashboard')]
            );
        }
    }

    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    error_log('annonces/create.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
