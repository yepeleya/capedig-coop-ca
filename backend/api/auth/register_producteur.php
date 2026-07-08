<?php
require_once __DIR__ . '/../../middleware/auth.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../_helpers.php';
require_once __DIR__ . '/../../config/mailer.php';
require_once __DIR__ . '/../../config/sms.php';

setSecurityHeaders();
rateLimit('register', max: 3, window: 300);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$data = getJsonBody();

// Validation stricte
$nom    = trim($data['nom']    ?? '');
$prenom = trim($data['prenom'] ?? '');
$email  = filter_var(trim($data['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$tel    = trim($data['telephone']    ?? '');
$loc    = trim($data['localisation'] ?? '');
$sec    = trim($data['section']      ?? '');
$mdp    = $data['mot_de_passe']      ?? '';

if (!$nom || !$prenom || !$email || !$tel || strlen($mdp) < 8) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Données invalides ou incomplètes (téléphone requis)']);
    exit;
}

if (!normaliserNumeroCI($tel)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Numéro de téléphone invalide (format ivoirien attendu)']);
    exit;
}

try {
    $pdo = getConnection();

    // Vérifier unicité email
    $check = $pdo->prepare("SELECT id FROM producteur WHERE email = ?");
    $check->execute([$email]);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Cet email est déjà utilisé']);
        exit;
    }

    // Générer un code unique
    $year = date('Y');
    $countStmt = $pdo->query("SELECT COUNT(*) FROM producteur");
    $count = (int)$countStmt->fetchColumn() + 1;
    $code  = "PRD-$year-" . str_pad($count, 3, '0', STR_PAD_LEFT);

    $hash = password_hash($mdp, PASSWORD_BCRYPT, ['cost' => 10]);

    // Code de vérification SMS (6 chiffres, valable 10 minutes)
    $codeSms   = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $smsExpire = date('Y-m-d H:i:s', time() + 600);

    $stmt = $pdo->prepare(
        "INSERT INTO producteur
         (code_producteur, nom, prenom, email, telephone,
          localisation, section, mot_de_passe, statut, code_sms, code_sms_expire)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', ?, ?)"
    );
    $stmt->execute([$code, $nom, $prenom, $email, $tel, $loc, $sec, $hash, $codeSms, $smsExpire]);
    $producteurId = (int)$pdo->lastInsertId();

    envoyerSms($tel, "CAPEDIG-COOP CA : votre code de verification est $codeSms. Valable 10 minutes.");

    creerNotification($pdo, 'inscription',
        "Nouveau producteur inscrit : $prenom $nom ($code)", '/admin/producteurs');

    // E-mail de bienvenue au producteur
    envoyerMail(
        $email,
        'Votre demande d\'adhésion a été reçue',
        "<p>Bonjour $prenom,</p>
         <p>Nous vous remercions pour votre demande d'adhésion à la
            <strong>CAPEDIG-COOP CA</strong>. Elle a été enregistrée avec succès
            sous le code producteur <strong>$code</strong>.</p>
         <p>Votre dossier est désormais <strong>en attente de validation</strong>
            par notre équipe. Vous recevrez un e-mail de confirmation dès que
            votre compte sera activé, généralement sous 48 heures.</p>
         <p>Merci de la confiance que vous accordez à notre coopérative.</p>",
        'DEMANDE D\'INSCRIPTION'
    );

    // Alerte e-mail à l'admin
    $q = $pdo->prepare("SELECT email FROM admin ORDER BY id ASC LIMIT 1");
    $q->execute();
    if ($adm = $q->fetch()) {
        envoyerMail(
            $adm['email'],
            "Nouvelle inscription producteur — $prenom $nom",
            "<p>Un nouveau producteur vient de soumettre une demande d'adhésion :</p>
             <p><strong>$prenom $nom</strong> — $code<br>
                E-mail : $email<br>
                Localisation : " . ($loc ?: '—') . "</p>
             <p>Merci de vérifier son dossier avant validation.</p>",
            'NOUVELLE INSCRIPTION',
            ['label' => 'Examiner la demande', 'url' => siteUrl('/admin/producteurs')]
        );
    }

    echo json_encode([
        'success'        => true,
        'message'        => 'Demande enregistrée. Vérifiez le code envoyé par SMS.',
        'code'           => $code,
        'producteur_id'  => $producteurId,
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur serveur']);
}
