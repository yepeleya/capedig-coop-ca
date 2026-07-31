-- ══════════════════════════════════════════════════════════════
-- MIGRATION : Actions de conversation (bloquer producteur)
-- Exécuter une seule fois dans phpMyAdmin
-- ══════════════════════════════════════════════════════════════

ALTER TABLE conversation
    ADD COLUMN bloquee TINYINT(1) NOT NULL DEFAULT 0 AFTER prioritaire;
