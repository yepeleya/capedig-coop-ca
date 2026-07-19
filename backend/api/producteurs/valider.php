<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/jwt.php';
require_once __DIR__ . '/../../config/mailer.php';

setSecurityHeaders();
requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data   = getJsonBody();
$id     = (int)($data['id']     ?? 0);
$statut = trim($data['statut']  ?? '');

if (!$id || !in_array($statut, ['actif', 'suspendu', 'en_attente'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données invalides']);
    exit;
}

try {
    $pdo = getConnection();

    // NOTE : la vérification obligatoire du téléphone par SMS est temporairement
    // suspendue (crédit SMS non encore rechargé côté fournisseur). L'admin peut
    // donc valider un compte même si tel_verifie = 0. Le badge « Téléphone non
    // vérifié » reste affiché à titre informatif dans la liste des producteurs.
    // → Pour réactiver le blocage strict une fois le crédit SMS disponible,
    //   décommenter le contrôle ci-dessous.
    /*
    if ($statut === 'actif') {
        $check = $pdo->prepare("SELECT tel_verifie FROM producteur WHERE id = ?");
        $check->execute([$id]);
        $row = $check->fetch();
        if (!$row) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Producteur introuvable']);
            exit;
        }
        if (!$row['tel_verifie']) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => "Impossible d'activer ce compte : le numéro de téléphone n'a pas encore été vérifié par SMS.",
            ]);
            exit;
        }
    }
    */

    $stmt = $pdo->prepare("UPDATE producteur SET statut = ? WHERE id = ?");
    $stmt->execute([$statut, $id]);

    // E-mail au producteur si son compte vient d'être activé
    if ($statut === 'actif') {
        $q = $pdo->prepare("SELECT email, prenom, code_producteur FROM producteur WHERE id = ?");
        $q->execute([$id]);
        if ($prd = $q->fetch()) {
            envoyerMail(
                $prd['email'],
                'Votre compte producteur est activé',
                "<p>Bonjour {$prd['prenom']},</p>
                 <p>Nous avons le plaisir de vous informer que votre compte
                    producteur (<strong>{$prd['code_producteur']}</strong>) a été
                    validé par l'administration de la <strong>CAPEDIG-COOP CA</strong>.</p>
                 <p>Vous pouvez dès à présent accéder à votre espace personnel avec
                    votre e-mail et votre mot de passe, afin de consulter les
                    annonces de la coopérative, vos documents officiels et échanger
                    directement avec l'administration.</p>
                 <p>Bienvenue parmi nos producteurs !</p>",
                'COMPTE ACTIVÉ',
                ['label' => 'Accéder à mon espace producteur', 'url' => siteUrl('/login-producteur')]
            );
        }
    }

    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
