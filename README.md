# MARIKI FAMILY PORTAL (PRO)

Modern family portal: Auth, Members, Contributions, Announcements, SMS Broadcast.

## Stack
- HTML + Tailwind (CDN)
- Vanilla JS (ES Modules)
- Firebase v12 (Auth, Firestore, Storage)
- SweetAlert2, Lucide Icons, SheetJS
- Netlify Functions (Beem Africa SMS)

## Setup

1. **Firebase**
   - Create a Firebase project → enable **Authentication (Email/Password)**, **Firestore**, **Storage**.
   - Copy your web config into `private/firebase.js` (replace the placeholder).
   - Create the first admin: register a normal user, then in Firestore set `users/{uid}.role = "admin"`.

2. **Beem Africa SMS** (Netlify env vars)
   - `BEEM_API_KEY`
   - `BEEM_SECRET_KEY`
   - `BEEM_SENDER_ID` (e.g. `MARIKI`)

3. **Deploy**
   - **Netlify**: drag the project folder into Netlify, or `netlify deploy`. The `netlify.toml` publishes `public/` and exposes `/.netlify/functions/sendSMS`.
   - **Firebase Hosting**: `firebase init hosting` with public dir = `public`. (SMS function still needs Netlify or a Firebase Function port.)

## Structure
```
public/        HTML pages + assets/css/js
private/       Firebase config, auth, guards, admin helpers
netlify/functions/sendSMS.js
```

## First Admin
After registering, run in Firestore console:
```
users/{uid} → role: "admin"
```
