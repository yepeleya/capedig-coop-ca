-- ================================================================
-- BASE DE DONNÉES CAPEDIG-COOP CA
-- Plateforme web institutionnelle
-- Auteure : YEO YEPELEYA TENENA — ISTC Polytechnique 2025-2026
-- ================================================================

-- Créer et sélectionner la base
DROP DATABASE IF EXISTS capedig_db;
CREATE DATABASE capedig_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE capedig_db;

-- ================================================================
-- TABLE : admin
-- ================================================================
CREATE TABLE admin (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nom           VARCHAR(30)  NOT NULL,
    prenom        VARCHAR(50)  NOT NULL,
    email         VARCHAR(60) NOT NULL UNIQUE,
    mot_de_passe  VARCHAR(100) NOT NULL,
    tel_admin     VARCHAR(20),
    photo         VARCHAR(100),
    role          ENUM('super_admin','admin') NOT NULL DEFAULT 'admin',
    statut        ENUM('actif','suspendu')    NOT NULL DEFAULT 'actif',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : producteur
-- ================================================================
CREATE TABLE producteur (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    code_producteur  VARCHAR(20)  NOT NULL UNIQUE,
    nom              VARCHAR(30)  NOT NULL,
    prenom           VARCHAR(50)  NOT NULL,
    email            VARCHAR(60) NOT NULL UNIQUE,
    telephone        VARCHAR(20),
    localisation     VARCHAR(50),
    section          VARCHAR(30),
    num_membre       VARCHAR(30),
    statut           ENUM('actif','en_attente','suspendu') NOT NULL DEFAULT 'en_attente',
    mot_de_passe     VARCHAR(100) NOT NULL,
    photo            VARCHAR(100),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : annonce
-- ================================================================
CREATE TABLE annonce (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(40) NOT NULL,
    contenu     TEXT         NOT NULL,
    image       VARCHAR(100),
    categorie   VARCHAR(40)  NOT NULL DEFAULT 'cooperative',
    statut      ENUM('publiee','brouillon','programmee') NOT NULL DEFAULT 'brouillon',
    date_publication DATETIME DEFAULT NULL,
    date_suppression DATETIME DEFAULT NULL,
    admin_id    INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : actualite
-- ================================================================
CREATE TABLE actualite (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(40) NOT NULL,
    contenu     TEXT         NOT NULL,
    image       VARCHAR(100),
    categorie   VARCHAR(40),
    statut      ENUM('publiee','brouillon','programmee') NOT NULL DEFAULT 'brouillon',
    date_publication DATETIME DEFAULT NULL,
    date_suppression DATETIME DEFAULT NULL,
    admin_id    INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : document
-- ================================================================
CREATE TABLE document (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    titre         VARCHAR(40) NOT NULL,
    fichier       VARCHAR(100) NOT NULL,
    type_fichier  VARCHAR(20),
    description   TEXT,
    acces         ENUM('tous','actifs') NOT NULL DEFAULT 'actifs',
    categorie     VARCHAR(40) NOT NULL DEFAULT 'General',
    admin_id      INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admin(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : notification
-- ================================================================
CREATE TABLE notification (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    destinataire_type   ENUM('admin','producteur') NOT NULL DEFAULT 'admin',
    destinataire_id     INT NOT NULL DEFAULT 1,
    type                VARCHAR(30) NOT NULL,
    message             VARCHAR(255) NOT NULL,
    lien                VARCHAR(150) DEFAULT NULL,
    lu                  TINYINT(1) NOT NULL DEFAULT 0,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : message
-- ================================================================
CREATE TABLE message (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    expediteur_id     INT NOT NULL DEFAULT 0,
    expediteur_type   ENUM('admin','producteur') NOT NULL DEFAULT 'producteur',
    destinataire_id   INT NOT NULL DEFAULT 1,
    destinataire_type ENUM('admin','producteur') NOT NULL DEFAULT 'admin',
    sujet             VARCHAR(100),
    contenu           TEXT NOT NULL,
    lu                TINYINT(1) NOT NULL DEFAULT 0,
    reponse           TEXT,
    prioritaire       TINYINT(1) NOT NULL DEFAULT 0,
    resolu            TINYINT(1) NOT NULL DEFAULT 0,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : projet
-- ================================================================
CREATE TABLE projet (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    titre       VARCHAR(40) NOT NULL,
    description TEXT,
    image       VARCHAR(100),
    categorie   VARCHAR(40)  NOT NULL DEFAULT 'agricole',
    statut      ENUM('planifie','en_cours','termine','nouveau','pilote')
                NOT NULL DEFAULT 'planifie',
    date_debut  DATE,
    date_fin    DATE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : newsletter
-- ================================================================
CREATE TABLE newsletter (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    email      VARCHAR(60) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : contact_log  (messages formulaire public)
-- ================================================================
CREATE TABLE contact_log (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nom        VARCHAR(30) NOT NULL,
    email      VARCHAR(60) NOT NULL,
    sujet      VARCHAR(100),
    message    TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ================================================================
-- TABLE : config_coop  (paramètres généraux de la coopérative)
-- ================================================================
CREATE TABLE config_coop (
    id         INT PRIMARY KEY DEFAULT 1,
    nom        VARCHAR(40) NOT NULL DEFAULT 'CAPEDIG-COOP CA',
    adresse    TEXT,
    contact    VARCHAR(20),
    agrement   VARCHAR(50),
    site       VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO config_coop (id, nom, adresse, contact, agrement, site) VALUES (
    1,
    'CAPEDIG-COOP CA',
    'Avenue des Planteurs, Immeuble Cacao, Abidjan, Côte d''Ivoire',
    '+225272200000',
    'CI-ABJ-2023-B456',
    'www.capedig-coop.ci'
);

-- ================================================================
-- TRIGGER : hashage automatique MDP admin à l'INSERT
-- Permet de créer un admin depuis phpMyAdmin en tapant le MDP en clair
-- Le trigger le hash automatiquement si ce n'est pas déjà un hash bcrypt
-- ================================================================
DELIMITER $$

DROP TRIGGER IF EXISTS before_admin_insert$$
CREATE TRIGGER before_admin_insert
BEFORE INSERT ON admin
FOR EACH ROW
BEGIN
    IF NEW.mot_de_passe NOT LIKE '$2y$%'
       AND NEW.mot_de_passe NOT LIKE '$2b$%'
       AND LENGTH(NEW.mot_de_passe) < 60
    THEN
        SET NEW.mot_de_passe = SHA2(NEW.mot_de_passe, 256);
    END IF;
END$$

DELIMITER ;

-- ================================================================
-- DONNÉES : SUPER ADMIN — YEO YEPELEYA TENENA
-- Email    : tenenayeo00@gmail.com
-- Password : Admin123
-- Hash bcrypt $2y$ cost=10 (généré et vérifié)
-- ================================================================
INSERT INTO admin (nom, prenom, email, mot_de_passe, tel_admin, role, statut)
VALUES (
    'YEO',
    'Yepeleya Tenena',
    'tenenayeo00@gmail.com',
    '$2y$10$90YW7MchkdlHQ3AAJs.zOuEnh0xw7tou52tkFUDCLN/K0nQrbltDW',
    '+225 07 08 23 98 07',
    'super_admin',
    'actif'
);

-- ================================================================
-- DONNÉES : ADMINS DE TEST
-- Password pour tous : Admin2024  (hash bcrypt ci-dessous)
-- ================================================================
INSERT INTO admin (nom, prenom, email, mot_de_passe, role, statut) VALUES
(
    'Kouassi',
    'Adjoua Marie',
    'a.kouassi@capedig-coop.ci',
    '$2y$10$PWca9AWqsAMXzRH5.W8vI.3fxjaodJJUZ13Jpl5RyGeTfX7hLggui',
    'admin',
    'actif'
),
(
    'Bamba',
    'Ibrahim Moussa',
    'i.bamba@capedig-coop.ci',
    '$2y$10$PWca9AWqsAMXzRH5.W8vI.3fxjaodJJUZ13Jpl5RyGeTfX7hLggui',
    'admin',
    'actif'
);

-- ================================================================
-- DONNÉES : PRODUCTEURS DE TEST
-- Password pour tous : Producteur2024
-- Hash bcrypt ci-dessous
-- ================================================================
INSERT INTO producteur
  (code_producteur, nom, prenom, email, telephone,
   localisation, section, statut, mot_de_passe)
VALUES
(
    'PRD-2024-001', 'Yao', 'Koffi Bernard',
    'koffi.yao@gmail.com', '+225 07 01 11 22 33',
    'Soubré', 'Section A', 'actif',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-002', 'Kouadio', 'Affoué Sandrine',
    'affoue.kouadio@gmail.com', '+225 05 02 22 33 44',
    'Daloa', 'Section B', 'actif',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-003', 'Diabaté', 'Mamadou Oumar',
    'mamadou.diabate@gmail.com', '+225 01 03 33 44 55',
    'Gagnoa', 'Section A', 'actif',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-004', 'N''Guessan', 'Akissi Pauline',
    'akissi.nguessan@gmail.com', '+225 07 04 44 55 66',
    'Abengourou', 'Section C', 'en_attente',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-005', 'Ouattara', 'Issouf Dramane',
    'issouf.ouattara@gmail.com', '+225 05 05 55 66 77',
    'Man', 'Section B', 'actif',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-006', 'Koné', 'Aminata Fatoumata',
    'aminata.kone@gmail.com', '+225 01 06 66 77 88',
    'Duékoué', 'Section C', 'suspendu',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-007', 'Goré', 'Jean-Baptiste Patrice',
    'jb.gore@gmail.com', '+225 07 07 77 88 99',
    'Divo', 'Section A', 'actif',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
),
(
    'PRD-2024-008', 'Sanogo', 'Awa Mariam',
    'awa.sanogo@gmail.com', '+225 05 08 88 99 00',
    'Agboville', 'Section B', 'en_attente',
    '$2y$10$P6BX7vzDKy1Lid/1c0I23OO1FN9FHw/IWWYVaJt68GYPrP1O8yyaC'
);

-- ================================================================
-- DONNÉES : ANNONCES DE TEST
-- ================================================================
INSERT INTO annonce (titre, contenu, categorie, statut, admin_id) VALUES
(
    'Campagne de récolte principale 2025',
    'La campagne de récolte du cacao débutera le 1er octobre 2025. '
    'Tous les producteurs sont invités à préparer leurs parcelles et à se '
    'présenter aux points de collecte habituels munis de leur carte de membre.',
    'cooperative', 'publiee', 1
),
(
    'Nouveau prix bord-champ — Campagne intermédiaire',
    'Le Conseil Café-Cacao a fixé le nouveau prix bord-champ à 1 200 FCFA/kg '
    'pour la campagne intermédiaire 2024-2025. Ce prix est effectif dès la '
    'semaine prochaine dans tous les centres de collecte agréés.',
    'marche', 'publiee', 1
),
(
    'Distribution gratuite d''engrais certifiés',
    'La coopérative procédera à la distribution gratuite d''engrais biologiques '
    'certifiés Rainforest Alliance à partir du 15 juillet 2025 dans tous les '
    'centres de section. Présentation de la carte de membre obligatoire.',
    'technique', 'publiee', 2
),
(
    'Réunion générale des délégués de section',
    'Une réunion générale est organisée le 30 juillet 2025 à Daloa '
    'pour présenter le bilan financier de la coopérative et voter '
    'le budget prévisionnel 2025-2026.',
    'cooperative', 'publiee', 1
),
(
    'Programme de formation agroforestière — Inscriptions ouvertes',
    'Inscriptions ouvertes pour le programme de formation aux techniques '
    'd''agroforesterie certifiées. 150 places disponibles. Priorité aux '
    'producteurs de moins de 5 ans d''adhésion.',
    'technique', 'brouillon', 2
);

-- ================================================================
-- DONNÉES : ACTUALITÉS DE TEST
-- ================================================================
INSERT INTO actualite (titre, contenu, categorie, statut, admin_id) VALUES
(
    'CAPEDIG-COOP CA certifiée Rainforest Alliance pour la 3ème année',
    'La coopérative vient d''obtenir le renouvellement de sa certification '
    'Rainforest Alliance pour l''ensemble de ses 14 sections de production. '
    'Un audit complet de 120 exploitations a confirmé le respect des normes '
    'environnementales et sociales exigées.',
    'Certification', 'publiee', 1
),
(
    'Prévisions de récolte principale 2024 : résultats encourageants',
    'Analyse des conditions météorologiques et des rendements attendus pour '
    'la prochaine campagne de cacao. Les premières estimations tablent sur '
    'une progression de 8% par rapport à 2023, portée par les bonnes '
    'pratiques agronomiques adoptées par les membres.',
    'Récolte', 'publiee', 2
),
(
    'Session de formation sur l''agroforesterie — 150 producteurs formés',
    'Nos techniciens ont accompagné 150 producteurs dans la mise en œuvre '
    'de pratiques agroforestières durables. Ces formations s''inscrivent dans '
    'le cadre du programme "Cacao Durable 2030" financé par nos partenaires.',
    'Formation', 'publiee', 1
),
(
    'Inauguration du nouveau centre de stockage de Soubré',
    'La coopérative a inauguré un entrepôt moderne de 2 000 m² à Soubré, '
    'permettant d''améliorer significativement la qualité de stockage avant '
    'exportation. Cet investissement de 45 millions FCFA a été financé '
    'par les primes de certification.',
    'Infrastructure', 'publiee', 1
);

-- ================================================================
-- DONNÉES : DOCUMENTS DE TEST
-- ================================================================
INSERT INTO document (titre, fichier, type_fichier, description, acces, admin_id)
VALUES
(
    'Guide des bonnes pratiques agricoles 2024',
    'guide_bonnes_pratiques_2024.pdf',
    'pdf',
    'Guide complet détaillant les bonnes pratiques de culture, récolte et '
    'fermentation du cacao conformément aux certifications Fairtrade et Rainforest Alliance.',
    'tous', 1
),
(
    'Statuts de la coopérative CAPEDIG-COOP CA',
    'statuts_capedig_2024.pdf',
    'pdf',
    'Document officiel des statuts de la coopérative, mis à jour lors de '
    'l''assemblée générale extraordinaire de mars 2024.',
    'tous', 1
),
(
    'Calendrier des paiements — Campagne 2025',
    'calendrier_paiements_2025.pdf',
    'pdf',
    'Planning prévisionnel des dates et modalités de paiement aux producteurs '
    'actifs pour la campagne principale 2025.',
    'actifs', 2
),
(
    'Rapport financier annuel 2023',
    'rapport_financier_2023.pdf',
    'pdf',
    'Bilan financier complet de l''exercice 2023, présenté lors de l''assemblée '
    'générale ordinaire. Document réservé aux membres actifs.',
    'actifs', 1
),
(
    'Formulaire de demande d''attestation d''adhésion',
    'formulaire_attestation.docx',
    'docx',
    'Modèle de formulaire à remplir pour obtenir une attestation officielle '
    'd''adhésion à la coopérative.',
    'tous', 1
);

-- ================================================================
-- DONNÉES : MESSAGES DE TEST
-- ================================================================
INSERT INTO message
  (expediteur_id, expediteur_type, destinataire_id, destinataire_type,
   sujet, contenu, lu, reponse, prioritaire)
VALUES
(
    1, 'producteur', 1, 'admin',
    'Problème de paiement — campagne intermédiaire',
    'Bonjour l''administration de la CAPEDIG-COOP CA,\n\nJe n''ai pas reçu '
    'mon paiement pour les 12 sacs de cacao livrés le 15 mars dernier '
    'au centre de collecte de Soubré.\n\nMon code producteur : PRD-2024-001\n\n'
    'Merci de vérifier et de me tenir informé.\n\nCordialement, Koffi Yao',
    1,
    'Bonjour M. Yao,\n\nNous avons bien reçu votre message. Votre paiement '
    'a été traité le 22 mars et sera crédité sous 48h.\n\nCordialement, Admin CAPEDIG',
    1
),
(
    2, 'producteur', 1, 'admin',
    'Demande de certificat d''adhésion',
    'Bonjour,\n\nJe souhaiterais obtenir un certificat officiel d''adhésion '
    'à la coopérative pour ma demande de crédit agricole auprès de la CNCE.\n\n'
    'Merci d''avance.\nAffouée Sandrine Kouadio — PRD-2024-002',
    0, NULL, 0
),
(
    3, 'producteur', 1, 'admin',
    'Question sur le programme de formation',
    'Bonjour,\n\nQuelles sont les conditions pour s''inscrire au programme '
    'de formation agroforestière ? Je suis producteur depuis 3 ans.\n\n'
    'Mamadou Diabaté — PRD-2024-003',
    0, NULL, 0
),
(
    5, 'producteur', 1, 'admin',
    'Signalement : balance défectueuse au centre de Man',
    'URGENT — La balance du centre de collecte de Man semble défectueuse. '
    'Plusieurs producteurs ont signalé des écarts de poids lors de la pesée.\n\n'
    'Issouf Ouattara',
    0, NULL, 1
);

-- ================================================================
-- DONNÉES : PROJETS DE TEST
-- ================================================================
INSERT INTO projet (titre, description, categorie, statut, date_debut, date_fin)
VALUES
(
    'Renforcement de la cacao-culture — Région du Guémon',
    'Optimisation des rendements et techniques de récolte durable pour '
    'une meilleure productivité. Programme de 2 ans couvrant 500 exploitations.',
    'agricole', 'en_cours', '2024-01-15', '2025-12-31'
),
(
    'Soutien à l''éducation rurale',
    'Construction et rénovation d''écoles primaires pour les enfants des '
    'membres de la coopérative dans les zones reculées de la région.',
    'social', 'termine', '2023-03-01', '2024-11-30'
),
(
    'Reboisement Communautaire — Vision Green',
    'Plantation de 10 000 arbres d''ombrage pour favoriser la biodiversité '
    'et protéger les plantations contre le changement climatique.',
    'environnemental', 'en_cours', '2024-06-01', '2026-06-30'
),
(
    'Modernisation des centres d''infrastructure',
    'Amélioration des centres de collecte et des équipements de séchage '
    'du cacao dans 5 sections prioritaires.',
    'agricole', 'nouveau', '2025-09-01', '2026-08-31'
),
(
    'Empowerment des femmes productrices',
    'Formation et micro-financement pour les activités génératrices de revenus '
    'des femmes membres de la coopérative. 200 bénéficiaires ciblées.',
    'social', 'en_cours', '2024-04-01', '2025-09-30'
),
(
    'Énergie Solaire Rurale — Centres de collecte',
    'Installation de panneaux solaires dans les centres de traitement de '
    '3 sections pour une énergie propre et économique.',
    'environnemental', 'pilote', '2025-02-01', '2025-10-31'
);

-- ================================================================
-- VÉRIFICATION FINALE
-- ================================================================
SELECT 'admin'      AS table_name, COUNT(*) AS total FROM admin
UNION ALL
SELECT 'producteur', COUNT(*) FROM producteur
UNION ALL
SELECT 'annonce',    COUNT(*) FROM annonce
UNION ALL
SELECT 'actualite',  COUNT(*) FROM actualite
UNION ALL
SELECT 'document',   COUNT(*) FROM document
UNION ALL
SELECT 'message',    COUNT(*) FROM message
UNION ALL
SELECT 'projet',     COUNT(*) FROM projet
UNION ALL
SELECT 'config_coop', COUNT(*) FROM config_coop;
