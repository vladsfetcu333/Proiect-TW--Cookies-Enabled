# Bug Tracker (SPA + REST + Prisma)

Aplicație web pentru gestionarea bug-urilor într-un proiect software.  
Scopul este să permită comunicarea între membrii echipei: **MP (member/project member)** și **TST (tester)**.

## Funcționalități (cerințe proiect)

- Autentificare cu cont pe bază de email (register/login)
- MP poate crea un proiect (cu repo URL) și devine automat MP în acel proiect
- Un utilizator care nu e în proiect se poate adăuga ca **tester (TST)** la proiect
- TST poate raporta un bug cu:
  - severitate
  - prioritate
  - descriere
  - link către commit (GitHub)
- MP poate vedea bug-urile pentru proiectele lui
- MP își poate aloca rezolvarea unui bug (un singur MP simultan)
- MP poate marca bug-ul ca rezolvat (status + link către commit fix)
- Sistem de permisiuni:
  - MP: create/modify proiect, vede bugs, assign, update status
  - TST: poate crea bug

## Tehnologii folosite

### Frontend

- React (Single Page Application)
- Vite (dev server/build)
- Fetch API pentru comunicare cu backend
- UI custom (CSS)

### Backend

- Node.js + Express
- REST API
- JWT authentication (Bearer token)
- Prisma ORM
- PostgreSQL (Prisma Postgres / cloud)

### Integrare externă

- GitHub API: validarea / listarea commit-urilor (folosit pentru link-urile de commit)

---

## Structura proiectului

bug-tracker/
backend/
frontend/

## Rulare locală (Development)

### 1) Backend

Într-un terminal:

```bash
cd backend
npm install
npm run dev
Backend pornește pe: http://localhost:3001
Health check: GET http://localhost:3001/health

Ai nevoie de variabilele de mediu în backend/.env (DATABASE + JWT_SECRET etc).

2) Frontend
În alt terminal:

bash
cd frontend
npm install
npm run dev
Frontend pornește pe http://localhost:5173 (sau portul pe care îl afișează Vite)

Configurare env
Frontend (API base url)
În frontend/.env:

env
Copiază codul
VITE_API_BASE=http://localhost:3001
Backend
În backend/.env există conexiunea la baza de date și secretul JWT.

Endpoint-uri principale (REST)
Auth
POST /auth/register -> { email, password, name }

POST /auth/login -> { email, password }

GET /auth/me -> user curent (token required)

Projects
POST /projects (MP) -> create project

GET /projects/my -> proiectele unde user-ul e membru

POST /projects/:id/join-tester -> user devine TST (dacă nu e membru)

Bugs
POST /projects/:id/bugs (TST) -> create bug

GET /projects/:id/bugs (MP) -> list bugs

POST /bugs/:id/assign-to-me (MP) -> assign bug

POST /bugs/:id/status (MP) -> set status / fix commit url
```
