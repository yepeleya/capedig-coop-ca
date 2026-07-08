<?php
require_once __DIR__ . '/../config/jwt.php';

/**
 * Vérifie le token JWT dans le header Authorization.
 * Si invalide → 401 + exit.
 * Si valide  → retourne le payload décodé.
 *
 * Usage en haut de chaque endpoint protégé :
 *   $auth = requireAuth();
 *   $admin_id = $auth['id'];
 */
function requireAuth(string $requiredRole = null): array
{
    $token = getTokenFromHeader();

    if (!$token) {
        http_response_code(401);
        echo json_encode(['error' => 'Token manquant']);
        exit;
    }

    $payload = verifyToken($token);

    if (!$payload) {
        http_response_code(401);
        echo json_encode(['error' => 'Token invalide ou expiré']);
        exit;
    }

    if ($requiredRole && ($payload['role'] ?? '') !== $requiredRole) {
        http_response_code(403);
        echo json_encode(['error' => 'Accès refusé — rôle insuffisant']);
        exit;
    }

    return $payload;
}

/**
 * Rate limiting simple par IP (stocké en session PHP).
 * Bloque après $max tentatives sur $window secondes.
 */
function rateLimit(string $key, int $max = 5, int $window = 60): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    $ip      = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $rlKey   = "rl_{$key}_{$ip}";
    $now     = time();

    if (!isset($_SESSION[$rlKey])) {
        $_SESSION[$rlKey] = ['count' => 0, 'reset_at' => $now + $window];
    }

    // Reset si la fenêtre est expirée
    if ($now > $_SESSION[$rlKey]['reset_at']) {
        $_SESSION[$rlKey] = ['count' => 0, 'reset_at' => $now + $window];
    }

    $_SESSION[$rlKey]['count']++;

    if ($_SESSION[$rlKey]['count'] > $max) {
        http_response_code(429);
        header('Retry-After: ' . ($window));
        echo json_encode(['error' => 'Trop de tentatives. Réessayez dans ' . $window . ' secondes.']);
        exit;
    }
}

/**
 * Headers communs de sécurité à appeler en haut de chaque fichier.
 */
function setSecurityHeaders(): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');

    // CORS
    $allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Répondre immédiatement aux preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Lit et décode le body JSON de la requête entrante.
 * Retourne un tableau (vide si body absent ou invalide).
 */
function getJsonBody(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}
