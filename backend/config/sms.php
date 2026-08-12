<?php
// ── Service d'envoi de SMS (Orange SMS API — Côte d'Ivoire) ───
// Doc officielle : https://developer.orange.com/apis/sms-ci/
//
// Configuration dans backend/.env :
//   ORANGE_CLIENT_ID=votre_client_id
//   ORANGE_CLIENT_SECRET=votre_client_secret
//   ORANGE_SENDER_ADDRESS=+2250000        (adresse expéditeur attribuée par
//                                           Orange lors de la création de
//                                           l'application / achat du bundle SMS)
//
// Si ORANGE_CLIENT_ID est vide → mode dev : le SMS est logué dans le fichier
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
 * Récupère un jeton d'accès OAuth2 (grant_type=client_credentials) auprès
 * de l'API Orange. Retourne null en cas d'échec.
 */
function obtenirJetonOrange(string $clientId, string $clientSecret): ?string
{
    $ch = curl_init('https://api.orange.com/oauth/v3/token');
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
            'Authorization: Basic ' . base64_encode("$clientId:$clientSecret"),
            'Content-Type: application/x-www-form-urlencoded',
        ],
        CURLOPT_POSTFIELDS     => 'grant_type=client_credentials',
    ]);
    $reponse = curl_exec($ch);
    $code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erreur  = curl_error($ch);
    curl_close($ch);

    if ($code < 200 || $code >= 300) {
        error_log("SMS (Orange) : échec obtention du jeton (HTTP $code) $erreur — $reponse");
        return null;
    }

    $data = json_decode($reponse, true);
    return $data['access_token'] ?? null;
}

/**
 * Envoie un SMS via l'API Orange Côte d'Ivoire. Retourne true si accepté
 * par l'API, false sinon. En mode dev (pas de client ID), log le message
 * et retourne true.
 */
function envoyerSms(string $telephone, string $message): bool
{
    chargerEnv();

    $clientId       = $_ENV['ORANGE_CLIENT_ID']       ?? '';
    $clientSecret   = $_ENV['ORANGE_CLIENT_SECRET']   ?? '';
    $senderAddress  = $_ENV['ORANGE_SENDER_ADDRESS']  ?? '';

    $numero = normaliserNumeroCI($telephone);
    if (!$numero) {
        error_log("SMS : numéro invalide « $telephone »");
        return false;
    }

    // Mode dev : pas d'identifiants → log uniquement
    if (!$clientId || !$clientSecret || !$senderAddress) {
        error_log("SMS (dev, non envoyé) → $numero : $message");
        return true;
    }

    $token = obtenirJetonOrange($clientId, $clientSecret);
    if (!$token) return false;

    $adresseExpediteur = 'tel:+' . preg_replace('/\D/', '', $senderAddress);
    $adresseDestinataire = 'tel:+' . $numero;

    // Doc officielle Orange SMS API CI :
    // POST https://api.orange.com/smsmessaging/v1/outbound/{senderAddress}/requests
    $url = 'https://api.orange.com/smsmessaging/v1/outbound/'
         . rawurlencode($adresseExpediteur) . '/requests';

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_CAINFO         => __DIR__ . '/cacert.pem',
        CURLOPT_POST           => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            "Authorization: Bearer $token",
        ],
        CURLOPT_POSTFIELDS     => json_encode([
            'outboundSMSMessageRequest' => [
                'address'                => [$adresseDestinataire],
                'senderAddress'          => $adresseExpediteur,
                'outboundSMSTextMessage' => ['message' => $message],
            ],
        ]),
    ]);
    $reponse = curl_exec($ch);
    $code    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erreur  = curl_error($ch);
    curl_close($ch);

    if ($code >= 200 && $code < 300) {
        return true;
    }

    error_log("SMS (Orange) : échec envoi à $numero (HTTP $code) $erreur — $reponse");
    return false;
}
