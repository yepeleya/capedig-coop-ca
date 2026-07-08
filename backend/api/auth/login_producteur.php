<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';

setSecurityHeaders();
rateLimit('login_prd', max: 5, window: 60);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data  = getJsonBody();
$login = trim($data['email'] ?? '');
$mdp   = $data['mot_de_passe'] ?? '';

if (!$login || !$mdp) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Champs requis manquants']);
    exit;
}

try {
    $pdo  = getConnection();
    // Accepte email OU code_producteur
    $stmt = $pdo->prepare(
        "SELECT id, code_producteur, nom, prenom, email, mot_de_passe,
                statut, section, localisation
         FROM producteur
         WHERE email = ? OR code_producteur = ?
         LIMIT 1"
    );
    $stmt->execute([$login, strtoupper($login)]);
    $prd = $stmt->fetch();

    if (!$prd || !password_verify($mdp, $prd['mot_de_passe'])) {
        // Temporisation
        if (!$prd) password_verify('dummy', '$2y$10$dummy_hash_aaaaaaaaaaaaaaaaa');
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Identifiants incorrects']);
        exit;
    }

    // Statut du compte
    if ($prd['statut'] !== 'actif') {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'statut'  => $prd['statut'],
            'message' => $prd['statut'] === 'en_attente'
                ? "Votre compte est en attente de validation par l'administration."
                : 'Votre compte a été suspendu. Contactez l\'administration.',
        ]);
        exit;
    }

    $token = generateToken([
        'id'    => $prd['id'],
        'email' => $prd['email'],
        'role'  => 'producteur',
        'type'  => 'producteur',
    ]);

    echo json_encode([
        'success' => true,
        'token'   => $token,
        'user'    => [
            'id'              => $prd['id'],
            'code_producteur' => $prd['code_producteur'],
            'nom'             => $prd['nom'],
            'prenom'          => $prd['prenom'],
            'email'           => $prd['email'],
            'statut'          => $prd['statut'],
            'section'         => $prd['section'],
            'localisation'    => $prd['localisation'],
        ],
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
