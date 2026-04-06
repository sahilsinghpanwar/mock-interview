# Quick Firestore Rules Fix

## 🚀 The Fastest Solution (2 Minutes)

### Copy This Exactly:

Go to: https://console.firebase.google.com/

1. Select project: **ai-interview-5780b**
2. Click **Firestore Database**
3. Click **Rules** tab
4. Delete ALL existing text
5. Paste this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click **Publish** (top right)
7. Wait for: "Rules updated successfully" ✅
8. Restart: `npm run dev`
9. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
10. Done! ✅

---

## Why This Works

- `request.auth != null` = User must be signed in
- Allows all authenticated users to read/write all data
- Perfect for development & testing
- NOT for production (switch to proper rules later)

---

## For Production Later

After testing works, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /interviews/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## Test It

```bash
npm run dev
# Go to http://localhost:3000
# Sign in
# Try to create interview
# Check console (F12) for errors
# Should work! ✅
```

---

Done! 🎉
