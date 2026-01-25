# PFE CT Platform

## Démarrage (DEV)

### 1) Base de données (PostgreSQL)
docker compose up -d

### 2) Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

### 3) Frontend
cd ../frontend
npm install
npm run dev

## URLs
- Backend health: http://localhost:4000/health
- Frontend: http://localhost:5173/
