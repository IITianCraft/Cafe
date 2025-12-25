# Nourish Admin Dashboard + Firebase Backend

This repository contains the Admin Dashboard frontend (React + Vite) and the production-ready Backend (Express + Firebase).

## Project Structure
- `/` - Frontend (Vite)
- `/server` - Backend (Express)

## Prerequisites
1. Node.js (v18+)
2. Firebase Project (Firestore, Auth, Storage enabled)

## Setup Instructions

### 1. Firebase Setup
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password provider).
3. Enable **Firestore Database** (start in test mode or production mode, we will deploy rules).
4. Enable **Storage** (start in test mode or production mode).
5. Go to **Project Settings > Service Accounts** and generate a new private key. Save the JSON.

### 2. Backend Setup (`/server`)
1. Navigate to server: `cd server`
2. Install dependencies: `npm install`
3. Create `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Fill in `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` from your JSON file.
   - **Important**: For `FIREBASE_PRIVATE_KEY`, ensure you handle newlines correctly. In `.env` file, it should be a single line with `\n` or wrapped in quotes preserving newlines depending on your OS/parser. The code handles `\n` replacement.
5. Set `FRONTEND_ORIGIN` to your frontend URL (e.g., `http://localhost:8080` or your Vercel URL).

### 3. Frontend Setup (`/`)
1. Install dependencies: `npm install`
2. Update `.env` (or create if missing) with Firebase Client config:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_API_BASE_URL=http://localhost:5000 
   ```
   (In production, set `VITE_API_BASE_URL` to your backend URL).

### 4. Deploying Security Rules
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize/Link project if needed or just deploy rules:
   ```bash
   firebase deploy --only firestore:rules,storage
   ```
   (Ensure `firestore.rules` and `storage.rules` are in the root).

## Production Deployment

### Backend (Railway/Render)
1. Push this repo to GitHub.
2. Connect Railway/Render to this repo.
3. **Root Directory**: Set to `./server`.
4. **Environment Variables**: Add all variables from `server/.env.example`.
   - For `FIREBASE_PRIVATE_KEY` in Railway, paste the raw key (including newlines) into the variable value. The server code handles both `\n` literals and actual newlines.
5. Get the deployed URL (e.g., `https://nourish-backend.railway.app`).

### Frontend (Vercel)
1. Connect Vercel to this repo.
2. **Root Directory**: `.` (Root).
3. **Environment Variables**:
   - Add all `VITE_FIREBASE_...` vars.
   - Set `VITE_API_BASE_URL` to your Backend URL (e.g., `https://nourish-backend.railway.app`).

## Admin Tasks & Seeding

### Initial Seeding
1. Create an account on the Frontend (Sign Up).
2. Go to Firestore Console > `users` collection > find your User ID > change/add field `role: "admin"`.
3. Log out and Log in again to refresh role.
4. Go to `/admin/settings` (Settings Page).
5. Click **Seed Database** to populate initial menu items and orders.
6. Click **Remove Demo Data** to clean up later.

### API Endpoints
- **Auth**: `POST /api/auth/verify`
- **Menu**: `GET /api/menu`, `POST /api/menu` (Admin), `PUT /api/menu/:id` (Admin), `DELETE`
- **Orders**: `GET /api/orders` (User/Admin), `POST /api/orders`, `PUT /api/orders/:id` (Admin)
- **Uploads**: `POST /api/uploads/url` (Admin) - Generates Signed URL for direct upload.
