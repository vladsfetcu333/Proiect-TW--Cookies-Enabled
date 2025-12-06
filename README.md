# Proiect-TW--Cookies-Enabled
BugTracker Pro este o aplicație web de tip Single Page Application destinată gestionării bug-urilor din proiecte software. Platforma facilitează colaborarea între membrii echipei (MP) și testeri (TST), oferind un flux clar pentru raportare, alocare și rezolvare a bug-urilor.

Funcționalități principale

Autentificare pe bază de email

Creare și administrare proiecte

Înrolare ca tester la un proiect

Adăugare bug (rol TST)

Vizualizare și alocare bug-uri (rol MP)

Actualizare status al rezolvării, împreună cu un link către commit-ul de rezolvare

Sistem de permisiuni diferențiat între MP și TST

Arhitectură

Frontend: React (SPA)

Backend: Node.js + Express (REST API)

ORM: Sequelize sau Prisma

Bază de date: PostgreSQL

Deployment: Railway sau Render

Structura echipei

Rachina Bianca – Documentație, baza de date, dashboard

Sfetcu Vlad – Backend API, gestionarea proiectelor

Simion David – Frontend UI, gestionarea bug-urilor



# BugTracker Pro – Proiect Tehnologii Web

Aplicatie web de tip Single Page Application (SPA) pentru gestionarea bug-urilor din proiecte software.

## Tehnologii

- **Frontend:** React (create-react-app)
- **Backend:** Node.js + Express (REST API)
- **Baza de date:** momentan in-memory (liste JS, PostgreSQL)
- **Comunicare:** HTTP + JSON

## Structura proiectului

```text
Proiect-TW--Cookies-Enabled
├─ frontend   # aplicatia React (Dashboard, UI)
└─ backend    # REST API Node + Express
```
## 1. Rulare backend (REST API)

Backend-ul foloseste Node.js + Express.

```bash
cd backend
npm install
npm start
```
Serverul porneste la: **http://localhost:4000**

### Endpoint-uri:

- `GET /` – test API  
- `GET /api/projects` – lista proiectelor  
- `POST /api/projects` – adauga proiect  
- `GET /api/bugs` – lista bug-urilor  
- `POST /api/bugs` – adauga bug  
- `PATCH /api/bugs/:id` – modifica status + commitLink  

---

## 2. Rulare frontend (React)

Intr-un alt terminal:

```bash
cd frontend
npm install
npm start
```
Frontend-ul pornește la: http://localhost:3000 

## 3. Testare rapida

   Porneste backend-ul:
- http://localhost:4000

   Porneste frontend-ul:
- http://localhost:3000


## 4. Baza de date
### Tabel Projects
- id  
- name  
- description  

### Tabel Bugs
- id  
- title  
- description  
- status  
- projectId  
- commitLink  



