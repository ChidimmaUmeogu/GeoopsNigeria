# GeoOps Nigeria — Deployment Guide

## What you need (both free, ~15 minutes total)

1. **Firebase** — the real-time database (free Spark plan)
2. **Netlify** — hosting your app (free plan)

---

## STEP 1: Create Firebase Project

1. Go to https://console.firebase.google.com
2. Click **"Add project"** → name it `geoops-nigeria` → click through defaults
3. Once created, click **"Build" → "Realtime Database"** in the left sidebar
4. Click **"Create Database"** → choose any region → select **"Start in test mode"** → Enable

5. Now get your config:
   - Click the ⚙️ gear icon → **"Project settings"**
   - Scroll to **"Your apps"** → click **"</>  Web"**
   - Register app name `geoops-web` → click "Register app"
   - Copy the `firebaseConfig` object — it looks like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "geoops-nigeria.firebaseapp.com",
  databaseURL: "https://geoops-nigeria-default-rtdb.firebaseio.com",
  projectId: "geoops-nigeria",
  storageBucket: "geoops-nigeria.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## STEP 2: Update Firebase Config in the App

Open the file `src/firebase.js` and **replace the entire firebaseConfig object** with your real values from Step 1.

---

## STEP 3: Deploy to Netlify

### Option A — Drag and Drop (easiest, no account needed)

1. Run `npm run build` in the project folder
2. Go to https://app.netlify.com/drop
3. Drag the `dist/` folder onto the page
4. Netlify gives you a URL like `https://geoops-random-name.netlify.app`
5. You can rename it under **Site settings → Site name**

### Option B — GitHub + Netlify (auto-deploys on changes)

1. Push this project to a GitHub repo
2. Go to https://app.netlify.com → "Add new site" → "Import from Git"
3. Connect GitHub → select your repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click Deploy

---

## STEP 4: Secure the Database (Important!)

After testing, update your Firebase Realtime Database **Rules** to prevent abuse:

Go to Firebase Console → Realtime Database → **Rules** tab, paste:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

This is fine for a classroom setting (students on your known network).
For extra security later, you can restrict by adding authentication.

---

## STEP 5: Change the Instructor PIN

Open `src/Instructor.jsx` and find line:
```js
const INSTRUCTOR_PIN = "1234";
```
Change `"1234"` to any PIN you want, then rebuild and redeploy.

---

## How to use in class

| Who | Action |
|-----|--------|
| **You (setup)** | Open `yourapp.netlify.app?view=instructor` on your laptop |
| **Projector** | Open `yourapp.netlify.app?view=projector` on the projector screen |
| **Students** | Open `yourapp.netlify.app` on their phones → choose Field Analyst |

The `?view=` URL shortcut skips the landing screen for convenience.

---

## Quick reference — Instructor workflow per session

1. Go to **Control tab** → select the mission → **INITIATE MISSION**
2. Students join and see the mission briefing + countdown automatically
3. As students submit tasks, they appear in your **VERIFY tab**
4. Tap **APPROVE** → score posts live to projector leaderboard
5. Drop **Intel Updates** anytime from the Control tab
6. At end → **END MISSION** (or it ends automatically when timer hits zero)

---

## Resetting for a new semester

Go to Instructor → Control tab → **RESET ALL DATA**
This clears all students, scores, and the queue.
