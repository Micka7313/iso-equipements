# AutoParts Comparator

Comparez les prix et disponibilités de pièces auto chez plusieurs fournisseurs en temps réel.

## Stack

- **Backend** : Node.js + Express
- **Frontend** : HTML / CSS / JS vanilla
- **Auth fournisseur** : OAuth2 Client Credentials (Amazon Cognito)

## Structure

```
autoparts-comparator/
├── backend/
│   ├── services/
│   │   └── VanheckService.js   # OAuth2 + appels API LKQ/VanHeck
│   ├── routes/
│   │   └── search.js           # GET /api/search?ref=XXXXXX
│   ├── server.js
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── package.json
└── README.md
```

## Installation

### 1. Prérequis

- Node.js ≥ 18
- npm ≥ 9

### 2. Cloner et installer

```bash
git clone <repo-url>
cd autoparts-comparator
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp backend/.env.example backend/.env
```

Éditez `backend/.env` et renseignez votre **Client Secret** VanHeck :

```env
PORT=3000

VANHECK_TOKEN_URL=https://lkq-carsys-fr-production.auth.eu-central-1.amazoncognito.com/oauth2/token
VANHECK_CLIENT_ID=1q5491gklchf6dil2njt62d77f
VANHECK_CLIENT_SECRET=<votre_secret_ici>

VANHECK_API_KEY=hHDG4EGRmq6y8l9y22afZBn2qVfGBq0Q
VANHECK_CATALOGUE_URL=https://lkq-europe-prod.apigee.net/gms-api-public-iframe-routes-fr/iframe/ticket?
```

> **Ne committez jamais le fichier `.env`** — il est listé dans `.gitignore`.

### 4. Lancer

```bash
# Production
npm start

# Développement (rechargement automatique)
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

## Utilisation

1. Saisissez une référence constructeur (ex : `1K0615301N`)
2. Cliquez sur **Rechercher**
3. Le tableau affiche pour chaque fournisseur : marque, prix HT, stock et délai

## API

### `GET /api/search?ref=XXXXXX`

**Réponse** :

```json
{
  "ref": "1K0615301N",
  "rows": [
    {
      "supplier": "VanHeck (LKQ)",
      "reference": "1K0615301N",
      "brand": "TRW",
      "price": 42.50,
      "currency": "EUR",
      "availability": 12,
      "deliveryDays": 1
    }
  ],
  "errors": []
}
```

`errors` contient les fournisseurs qui n'ont pas répondu (l'API reste fonctionnelle même si un fournisseur est en erreur).

## Ajouter un fournisseur

1. Créez `backend/services/MonFournisseurService.js` avec une méthode `searchByReference(ref)` qui retourne le même format de tableau.
2. Ajoutez l'entrée dans le tableau `suppliers` de `backend/routes/search.js`.

## Sécurité

- Le secret OAuth2 est uniquement côté serveur (jamais exposé au frontend).
- Le token est mis en cache et renouvelé automatiquement 60 s avant expiration.
- Toutes les sorties HTML sont échappées pour prévenir le XSS.
