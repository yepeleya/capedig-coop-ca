<?php
// ── Connexion PDO sécurisée ───────────────────────────────────
function getConnection(): PDO
{
    $host    = 'localhost';
    $db      = 'capedig_db';
    $user    = 'root';
    $pass    = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        // Désactive les requêtes multiples (protection injection)
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => false,
    ];

    try {
        return new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        // Ne jamais exposer le message d'erreur réel
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Erreur de connexion à la base de données']);
        exit;
    }
}
