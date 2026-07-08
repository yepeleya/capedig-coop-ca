<?php
// ── JWT maison léger (Header.Payload.Signature) ──────────────
// Compatible avec le frontend React (AuthContext.jsx)

// Charge .env si pas encore fait
if (!defined('JWT_SECRET')) {
    $envFile = __DIR__ . '/../.env';
    if (file_exists($envFile)) {
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            if (str_starts_with(trim($line), '#')) continue;
            [$k, $v] = array_map('trim', explode('=', $line, 2)) + [1 => ''];
            if ($k && !isset($_ENV[$k])) $_ENV[$k] = $v;
        }
    }
    $secret = $_ENV['JWT_SECRET'] ?? '';
    if (!$secret) {
        http_response_code(500);
        echo json_encode(['error' => 'Configuration serveur manquante']);
        exit;
    }
    define('JWT_SECRET', $secret);
    define('JWT_EXPIRY', 86400); // 24 heures
}

function generateToken(array $payload): string
{
    $header  = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $body      = base64_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header.$body", JWT_SECRET);
    return "$header.$body.$signature";
}

function verifyToken(string $token): ?array
{
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $body, $signature] = $parts;

    // Vérifie la signature
    $expected = hash_hmac('sha256', "$header.$body", JWT_SECRET);
    if (!hash_equals($expected, $signature)) return null;

    // Décode et vérifie expiration
    $payload = json_decode(base64_decode($body), true);
    if (!$payload || ($payload['exp'] ?? 0) < time()) return null;

    return $payload;
}

function getTokenFromHeader(): ?string
{
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
                ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
                ?? '';
    if (str_starts_with($authHeader, 'Bearer ')) {
        return substr($authHeader, 7);
    }
    return null;
}
