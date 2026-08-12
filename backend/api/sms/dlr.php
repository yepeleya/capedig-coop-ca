<?php
// ── Réception des accusés de livraison SMS (DLR) — API Orange ─────────
// Doc : https://developer.orange.com/apis/sms-ci/getting-started
//
// Orange appelle cette URL en POST (JSON) dans les 24h suivant l'envoi
// d'un SMS, avec le statut de livraison. Ce point de terminaison doit :
//   - être accessible en HTTPS sur le port 443 (une fois le site déployé)
//   - renvoyer HTTP 200 pour accuser réception, sinon Orange retentera
//   - être déclaré à Orange (formulaire "callback endpoint") avec son URL
//     publique, ex: https://votre-domaine.ci/api/sms/dlr.php
//
// Aucune authentification n'est requise ici : Orange whiteliste une IP
// sortante fixe de leur côté, il n'y a pas de secret à vérifier côté
// entrant (voir "Type d'authentification : Aucune authentification").
//
// Corps JSON attendu :
// {
//   "deliveryInfoNotification": {
//     "callbackData": "<resource_id du SMS envoyé>",
//     "deliveryInfo": {
//       "address": "tel:+225XXXXXXXXXX",
//       "deliveryStatus": "DeliveredToTerminal" | "DeliveryImpossible" | ...
//     }
//   }
// }

require_once __DIR__ . '/../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

$notif  = $data['deliveryInfoNotification'] ?? null;
$info   = $notif['deliveryInfo'] ?? null;
$statut = $info['deliveryStatus'] ?? null;
$adresse = $info['address'] ?? null;
$resourceId = $notif['callbackData'] ?? null;

// On logue systématiquement le DLR reçu — utile pour diagnostiquer les
// échecs d'envoi (numéro invalide, terminal éteint, etc.) sans bloquer
// la réponse à Orange.
error_log(sprintf(
    'SMS DLR reçu : resource_id=%s adresse=%s statut=%s',
    $resourceId ?? '?',
    $adresse ?? '?',
    $statut ?? '?'
));

// Répondre 200 OK dans tous les cas : Orange considère l'accusé comme
// non reçu (et retente) tant que ce code n'est pas renvoyé.
http_response_code(200);
echo json_encode(['success' => true]);
