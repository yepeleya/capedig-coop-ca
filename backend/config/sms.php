<?php
// ── Service d'envoi de SMS (LeTexto — Côte d'Ivoire) ──────────
// Configuration dans backend/.env :
//   SMS_TOKEN=votre_token_letexto
//   SMS_SENDER=CAPEDIG        (nom d'expéditeur, max 11 caractères)
//
// Si SMS_TOKEN est vide → mode dev : le SMS est logué dans le fichier
// d'erreurs PHP au lieu d'être envoyé (l'API ne plante jamais).

require_once __DIR__ . '/mailer.php'; // pour chargerEnv()

/**
 * Normalise un numéro ivoirien vers le format international 225XXXXXXXXXX.
 * Accepte : "+225 07 00 00 00 00", "0700000000", "225070000...", etc.
 * Retourne null si le numéro est inexploitable.
 */
function normaliserNumeroCI(string $tel): ?string
{
    $num = preg_replace('/\D/', '', $tel);   // ne garder que les chiffres
    if (str_starts_with($num, '00225')) $num = substr($num, 5);
    if (str_starts_with($num, '225'))   $num = substr($num, 3);
    // Numéro local ivoirien = 10 chiffres (nouveau plan de numérotation)
    if (strlen($num) !== 10) return null;
    return '225' . $num;
}

/**
 * Envoie un SMS. Retourne true si accepté par l'API, false sinon.
 * En mode dev (pas de token), log le message et retourne true.
 */
function envoyerSms(string $telephone, string $message): bool
{
    chargerEnv();

    $token  = $_ENV['SMS_TOKEN']  ?? '';
    $sender = $_ENV['SMS_SENDER'] ?? 'CAPEDIG';

    $numero = normaliserNumeroCI($telephone);
    if (!$numero) {
        error_log("SMS : numéro invalide « $telephone »");
        return false;
    }

    // Mode dev : pas de token → log uniquement
    if (!$token) {
        error_log("SMS (dev, non envoyé) → $numero : $message");
        return true;
    }

    // Doc officielle LeTexto : POST https://apis.letexto.com/v1/messages/send
    // (sous-domaine "apis" avec un s — pas "api"), token en Bearer, body JSON.
    $ch = curl_init('https://apis.letexto.com/v1/messages/send');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        // Certains environnements WAMP/Windows n'ont pas de CA bundle configuré
        // dans php.ini, ce qui fait échouer toute requête HTTPS via curl.
        // On fournit explicitement un bundle de confiance embarqué dans le projet.
        CURLOPT_CAINFO         => __DIR__ . '/cacert.pem',
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            "Authorization: Bearer $token",
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'from'    => $sender,
            'to'      => $numero,
            'content' => $message,
        ]),
    ]);
    $reponse = curl_exec($ch);
    $code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erreur  = curl_error($ch);
    curl_close($ch);

    if ($code >= 200 && $code < 300) {
        return true;
    }

    error_log("SMS : échec envoi à $numero (HTTP $code) $erreur — $reponse");
    return false;
}
