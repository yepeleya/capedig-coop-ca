<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
$auth = requireAuth();

// Seul le super_admin peut créer des admins
if (($auth['role'] ?? '') === 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Réservé au super administrateur']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data   = getJsonBody();
$nom    = trim($data['nom']    ?? '');
$prenom = trim($data['prenom'] ?? '');
$email  = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$mdp    = $data['mot_de_passe'] ?? '';
$role   = in_array($data['role'] ?? '', ['admin', 'super_admin']) ? $data['role'] : 'admin';

if (!$nom || !$email || strlen($mdp) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données invalides (nom, email, mdp ≥ 8 caractères requis)']);
    exit;
}

try {
    $pdo = getConnection();

    $check = $pdo->prepare("SELECT id FROM admin WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
        exit;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO admin (nom, prenom, email, mot_de_passe, role, statut)
         VALUES (?, ?, ?, ?, ?, 'actif')"
    );
    $stmt->execute([$nom, $prenom, $email, password_hash($mdp, PASSWORD_BCRYPT, ['cost' => 10]), $role]);
    echo json_encode(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
