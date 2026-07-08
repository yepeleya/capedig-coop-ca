<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data  = getJsonBody();
$nom   = trim($data['nom']    ?? '');
$prenom = trim($data['prenom'] ?? '');
$email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$tel   = trim($data['telephone'] ?? '');
$photo = $data['photo'] ?? null; // base64 ou URL existante

if (!$nom) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Le nom est requis']);
    exit;
}

// Sauvegarde une photo base64 sur disque ; conserve l'URL si déjà servie
$photoPath = null;
if ($photo && str_starts_with($photo, 'data:image/')) {
    $parts   = explode(',', $photo);
    $imgData = base64_decode($parts[1] ?? '');
    if ($imgData) {
        $dir = __DIR__ . '/../../../uploads/avatars/';
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $filename = 'admin_' . $auth['id'] . '_' . time() . '.jpg';
        file_put_contents($dir . $filename, $imgData);
        $photoPath = '/uploads/avatars/' . $filename;
    }
} elseif ($photo && str_starts_with($photo, '/uploads/')) {
    $photoPath = $photo;
}

try {
    $pdo = getConnection();
    if ($photoPath) {
        $pdo->prepare("UPDATE admin SET nom = ?, prenom = ?, email = ?, tel_admin = ?, photo = ? WHERE id = ?")
            ->execute([$nom, $prenom, $email ?: $data['email'], $tel, $photoPath, $auth['id']]);
    } else {
        $pdo->prepare("UPDATE admin SET nom = ?, prenom = ?, email = ?, tel_admin = ? WHERE id = ?")
            ->execute([$nom, $prenom, $email ?: $data['email'], $tel, $auth['id']]);
    }
    echo json_encode(['success' => true, 'photo' => $photoPath]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
