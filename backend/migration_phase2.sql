-- ══════════════════════════════════════════════════════════════
-- MIGRATION PHASE 2 : Profil éditable + Téléchargements + Rapports
-- Exécuter une seule fois dans phpMyAdmin
-- Compatible MySQL 5.7 / 8.x / 9.x
-- ══════════════════════════════════════════════════════════════

-- 1. Colonnes sur producteur (exécuter l'une après l'autre ; ignorer si "Duplicate column")
ALTER TABLE producteur
    ADD COLUMN telephone VARCHAR(20) NULL AFTER email;

ALTER TABLE producteur
    ADD COLUMN photo VARCHAR(100) NULL;

-- 2. Table historique des téléchargements
CREATE TABLE IF NOT EXISTS telechargement (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    document_id    INT NOT NULL,
    producteur_id  INT NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_producteur (producteur_id),
    KEY idx_document   (document_id),
    KEY idx_date       (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
