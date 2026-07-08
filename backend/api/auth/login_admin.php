<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
rateLimit('login_admin', max: 5, window: 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

$data = getJsonBody();

// Validation
$email = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$mdp   = $data['mot_de_passe'] ?? '';

if (!$email || strlen($mdp) < 1) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email et mot de passe requis']);
    exit;
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare(
        "SELECT id, nom, prenom, email, mot_de_passe, role, statut
         FROM admin
         WHERE email = ?
         LIMIT 1"
    );
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    // Message générique pour ne pas révéler si l'email existe
    $errMsg = ['success' => false, 'message' => 'Identifiants incorrects'];

    if (!$admin) {
        // Temporisation contre timing attack
        password_verify('dummy', '$2y$10$dummy_hash_to_waste_time_aaaaaa');
        http_response_code(401);
        echo json_encode($errMsg);
        exit;
    }

    if ($admin['statut'] !== 'actif') {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Compte inactif']);
        exit;
    }

    if (!password_verify($mdp, $admin['mot_de_passe'])) {
        http_response_code(401);
        echo json_encode($errMsg);
        exit;
    }

    // Rehash si nécessaire (upgrade cost)
    if (password_needs_rehash($admin['mot_de_passe'], PASSWORD_BCRYPT, ['cost' => 10])) {
        $newHash = password_hash($mdp, PASSWORD_BCRYPT, ['cost' => 10]);
        $pdo->prepare("UPDATE admin SET mot_de_passe = ? WHERE id = ?")
            ->execute([$newHash, $admin['id']]);
    }

    $token = generateToken([
        'id'    => $admin['id'],
        'email' => $admin['email'],
        'role'  => $admin['role'],
        'type'  => 'admin',
    ]);

    echo json_encode([
        'success' => true,
        'token'   => $token,
        'user'    => [
            'id'     => $admin['id'],
            'nom'    => $admin['nom'],
            'prenom' => $admin['prenom'],
            'email'  => $admin['email'],
            'role'   => $admin['role'],
        ],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
