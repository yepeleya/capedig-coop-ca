# Règles de sécurité — CAPEDIG (OBLIGATOIRES)

## Secrets & Variables d'environnement
- JAMAIS de clé API ou mot de passe en dur dans le code
- Tous les secrets dans .env.local (jamais commité, dans .gitignore)
- Variables React : préfixe VITE_ obligatoire pour l'accès côté client
- Clés sensibles backend (DB) : côté PHP uniquement, jamais exposées au frontend

## Authentification
- Toute page /admin/* et /producteur/* redirige vers /login si non connecté
- Tokens JWT validés côté serveur PHP à chaque requête API
- Logout : suppression complète du token (localStorage + état React)
- Cookies : Secure + HttpOnly + SameSite=Strict en production
- Mots de passe : password_hash() PHP avec PASSWORD_BCRYPT cost=10 UNIQUEMENT

## Inputs & Injections
- JAMAIS de concaténation SQL → requêtes préparées PDO UNIQUEMENT
  ❌ "SELECT * FROM admin WHERE email = '" . $email . "'"
  ✅ $stmt->execute([$email])
- Valider ET sanitiser tous les inputs côté PHP (pas seulement React)
- Pas de dangerouslySetInnerHTML avec contenu utilisateur
- Échapper tout output HTML

## API & CORS
- Headers CORS restrictifs : origin explicite, pas de wildcard *
- Rate limiting sur /api/auth/* (max 5 tentatives/minute par IP)
- Réponses d'erreur génériques : pas de détail technique exposé

## En-têtes de sécurité (dans .htaccess)
- Content-Security-Policy
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HTTPS uniquement en prod)

## Vérification finale
- npm audit avant chaque déploiement
- Aucun stack trace visible en production
- Fichier .env absent du repo Git
