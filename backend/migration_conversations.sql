-- ══════════════════════════════════════════════════════════════
-- MIGRATION : Système de conversations WhatsApp-style
-- Exécuter une seule fois dans phpMyAdmin
-- Compatible MySQL 5.7 / 8.x / 9.x
-- ══════════════════════════════════════════════════════════════

-- 1. Créer la table conversation
CREATE TABLE IF NOT EXISTS conversation (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    sujet         VARCHAR(80) NOT NULL,
    producteur_id INT NOT NULL,
    statut        ENUM('ouverte','close') NOT NULL DEFAULT 'ouverte',
    prioritaire   TINYINT(1)  NOT NULL DEFAULT 0,
    updated_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    KEY idx_producteur (producteur_id),
    KEY idx_statut (statut),
    KEY idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Ajouter conversation_id à message (ignorer l'erreur si la colonne existe déjà)
ALTER TABLE message
    ADD COLUMN conversation_id INT NULL AFTER id;

ALTER TABLE message
    ADD COLUMN destinataire_id INT NOT NULL DEFAULT 1 AFTER destinataire_type;

-- 3. Ajouter colonnes manquantes à annonce (ignorer l'erreur si elles existent déjà)
ALTER TABLE annonce
    ADD COLUMN image            VARCHAR(100) NULL AFTER contenu;

ALTER TABLE annonce
    ADD COLUMN date_publication DATETIME NULL;

ALTER TABLE annonce
    ADD COLUMN date_suppression DATETIME NULL;

-- 4. Migrer les messages existants vers des conversations
INSERT INTO conversation (sujet, producteur_id, statut, created_at, updated_at)
SELECT
    COALESCE(NULLIF(TRIM(m.sujet),''), '(sans objet)') AS sujet,
    m.expediteur_id                                     AS producteur_id,
    IF(m.resolu = 1, 'close', 'ouverte')               AS statut,
    m.created_at,
    m.created_at
FROM message m
WHERE m.expediteur_type = 'producteur'
  AND m.conversation_id IS NULL;

-- 5. Lier chaque message à sa nouvelle conversation
UPDATE message m
JOIN (
    SELECT
        msg.id AS msg_id,
        c.id   AS conv_id
    FROM message msg
    JOIN conversation c
      ON c.producteur_id = msg.expediteur_id
     AND c.sujet = COALESCE(NULLIF(TRIM(msg.sujet),''), '(sans objet)')
     AND c.created_at = msg.created_at
    WHERE msg.expediteur_type = 'producteur'
      AND msg.conversation_id IS NULL
) link ON link.msg_id = m.id
SET m.conversation_id  = link.conv_id,
    m.destinataire_type = 'admin',
    m.destinataire_id   = 1
WHERE m.conversation_id IS NULL;

-- 6. Créer les réponses admin comme messages séparés
INSERT INTO message (conversation_id, contenu, expediteur_type, expediteur_id,
                     destinataire_type, destinataire_id, sujet, lu, created_at)
SELECT
    m.conversation_id,
    m.reponse,
    'admin'         AS expediteur_type,
    1               AS expediteur_id,
    'producteur'    AS destinataire_type,
    m.expediteur_id AS destinataire_id,
    m.sujet,
    1               AS lu,
    DATE_ADD(m.created_at, INTERVAL 1 SECOND)
FROM message m
WHERE m.reponse IS NOT NULL
  AND m.reponse != ''
  AND m.conversation_id IS NOT NULL
  AND m.expediteur_type = 'producteur';
