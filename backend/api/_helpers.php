<?php
/**
 * Template de démarrage pour chaque endpoint protégé.
 * Copier-coller ce bloc en haut de chaque fichier API admin/producteur :
 *
 *   require_once __DIR__ . '/../_helpers.php';
 *   // ou adapter le chemin selon la profondeur
 *   $auth = requireAuth(); // bloque si non connecté
 */

// Inclusions nécessaires pour tout endpoint
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';

/**
 * Crée une notification persistante (affichée dans la cloche du header admin
 * ou producteur). Par défaut destinée à l'admin (id 1) ; passer
 * destinataire_type='producteur' et destinataire_id=<id> pour notifier un
 * producteur précis. À appeler après toute action qui doit informer
 * l'utilisateur concerné.
 */
function creerNotification(
    PDO $pdo,
    string $type,
    string $message,
    ?string $lien = null,
    string $destinataireType = 'admin',
    int $destinataireId = 1
): void {
    try {
        $pdo->prepare(
            "INSERT INTO notification (destinataire_type, destinataire_id, type, message, lien)
             VALUES (?, ?, ?, ?, ?)"
        )->execute([$destinataireType, $destinataireId, $type, $message, $lien]);
    } catch (PDOException $e) {
        // Une notification ratée ne doit jamais faire échouer l'action principale
    }
}
