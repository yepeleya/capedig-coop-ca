-- ══════════════════════════════════════════════════════════════
-- MIGRATION : Vérification du téléphone par SMS à l'inscription
-- Exécuter une seule fois dans phpMyAdmin
-- (ignorer l'erreur "Duplicate column" si déjà exécutée)
-- ══════════════════════════════════════════════════════════════

ALTER TABLE producteur ADD COLUMN code_sms VARCHAR(6) NULL;
ALTER TABLE producteur ADD COLUMN code_sms_expire DATETIME NULL;
ALTER TABLE producteur ADD COLUMN tel_verifie TINYINT(1) NOT NULL DEFAULT 0;
