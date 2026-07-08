# Stack et conventions — CAPEDIG

## Frontend
- React 19 avec hooks fonctionnels (pas de classes)
- Tailwind CSS 3 — classes utilitaires UNIQUEMENT
- Vite 5 pour le build
- React Router DOM v7 pour la navigation
- Axios pour les appels API
- Recharts pour les graphiques (dashboard admin)

## Conventions de code
- Composants : PascalCase (Navbar.jsx, Footer.jsx)
- Hooks : camelCase préfixé use (useReveal.js, useCounter.js)
- Toujours exporter en default export
- Imports relatifs depuis src/

## Palette de couleurs (RÈGLE ABSOLUE)
| Rôle                  | Classe Tailwind          | Hex      |
|-----------------------|--------------------------|----------|
| Navbar / Footer       | bg-capedig-brun          | #3D2314  |
| Menu mobile / overlay | bg-capedig-brun-deep     | #2A1509  |
| Boutons principaux    | bg-capedig-orange        | #D4641A  |
| Hover boutons         | bg-capedig-orange-light  | #E8762A  |
| Espace Producteurs    | bg-capedig-vert          | #2D6A4F  |
| Fond de page          | bg-capedig-beige         | #F5F0EB  |
| Bordures / séparateurs| border-capedig-beige-dark| #EDE5DB  |

## Animations (toujours utiliser ces classes CSS)
- Scroll reveal : classe `reveal` + `reveal-left` + `reveal-right` → hook useReveal()
- Boutons CTA : classe `btn-shine`
- Cards : classe `card-hover`
- Images : wrapper `img-container` avec `.img-bg`
- Texte accentué : classe `text-gradient`

## Backend
- PHP 8+ avec PDO (requêtes préparées UNIQUEMENT)
- MySQL via phpMyAdmin (WAMP en local)
- Endpoints dans backend/api/
- Authentification JWT maison (pas de librairie externe)
