# 🔐 Firestore Permission Denied Error - Complete Fix Guide

## ❌ Error You're Getting
```
FirebaseError: Missing or insufficient permissions.
code: 'permission-denied'
```

This happens because **Firestore security rules are blocking access**.

---

## ✅ Solution: Update Firestore Security Rules

### Step 1: Go to Firebase Console

1. Visit: https://console.firebase.google.com/
2. Select your project: **ai-interview-5780b**
3. Go to **Firestore Database** (left sidebar)
4. Click on **Rules** tab

### Step 2: Replace Rules with Development Rules

**Clear the existing rules and paste this:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow anyone to read/write (DEVELOPMENT ONLY!)
    // ⚠️ WARNING: This is INSECURE for production!
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 3: Publish Rules

1. Click **Publish** button (top right)
2. Wait for confirmation: "Rules updated successfully"
3. ✅ Rules are now live

### Step 4: Test Locally

```bash
npm run dev
# Go to http://localhost:3000
# Try signing in and starting an interview
# Check browser console for errors
```

---

## 🔒 Production-Ready Rules (Secure)

**For production, use these rules instead:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - only own user can access
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // Interview sessions - only owner can access
    match /interviews/{sessionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
    
    // Public data (if needed)
    match /public/{document=**} {
      allow read: if true;
    }
  }
}
```

---

## 📋 Step-by-Step Visual Guide

### In Firebase Console:

```
1. Go to: https://console.firebase.google.com
   ↓
2. Select Project: "ai-interview-5780b"
   ↓
3. Click: Firestore Database (left menu)
   ↓
4. Click: Rules tab (top navigation)
   ↓
5. Delete all existing text
   ↓
6. Paste the rules above
   ↓
7. Click: Publish (top right)
   ↓
8. Wait for confirmation
   ↓
9. ✅ Done!
```

---

## 🧪 Test After Updating Rules

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Check browser console
Open browser: http://localhost:3000
Press F12 → Console tab

# Try to:
1. Sign in with email/password
2. Create account
3. Start new interview
4. Complete interview

# Expected: No permission errors!
```

---

## ❓ Why This Error Happens

| Scenario | Cause | Fix |
|----------|-------|-----|
| Just created Firebase project | No rules set | Add development rules |
| Rules too restrictive | `allow read, write: if false;` | Update to allow authenticated users |
| Not authenticated | User not signed in | Make sure user is logged in |
| Wrong database name | Rules for different database | Check Firestore instance name |

---

## ⚠️ Important: Development vs Production

### Development (Testing)
```javascript
// Allows anyone signed in to read/write
match /{document=**} {
  allow read, write: if request.auth != null;
}
```
✅ Easy to test
❌ NOT SECURE for production

### Production (Live)
```javascript
// Only user can access their own data
match /interviews/{sessionId} {
  allow read, write: if request.auth.uid == resource.data.userId;
}
```
✅ Secure
❌ Requires proper implementation

---

## 🐛 If Error Still Persists

### Check 1: Verify User is Authenticated
```javascript
// In browser console:
firebase.auth().currentUser
// Should show user object, not null
```

### Check 2: Verify Firestore Instance
```javascript
// In browser console:
db
// Should show Firestore instance
```

### Check 3: Check Collection Names
Make sure collection names match:
- Rules: `interviews`
- Code: `collection("interviews")`

### Check 4: Reload Everything
```bash
1. Stop dev server: Ctrl+C
2. Clear cache: rm -rf .next
3. Restart: npm run dev
4. Hard refresh browser: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

---

## 🔍 Rule Syntax Explanation

```javascript
rules_version = '2';  // Latest Firestore rules version

service cloud.firestore {  // Firestore service
  match /databases/{database}/documents {  // All documents
    
    // Pattern: match /collection/{documentId}
    match /interviews/{sessionId} {
      
      // Allow read if user owns the interview
      allow read: if request.auth.uid == resource.data.userId;
      
      // Allow write if user owns the interview
      allow write: if request.auth.uid == resource.data.userId;
      
      // Allow create if creating user's own data
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

---

## 📚 Firestore Security Rules Cheat Sheet

```javascript
// Allow everyone (INSECURE)
allow read, write: if true;

// Allow only authenticated users
allow read, write: if request.auth != null;

// Allow only user accessing their own data
allow read, write: if request.auth.uid == resource.data.userId;

// Allow read to everyone, write to owner only
allow read: if true;
allow write: if request.auth.uid == resource.data.userId;

// Allow creation if user sets themselves as owner
allow create: if request.auth.uid == request.resource.data.userId;
allow read, write: if request.auth.uid == resource.data.userId;

// Allow admins only
allow read, write: if request.auth.token.admin == true;
```

---

## ✅ Complete Fix Checklist

- [ ] Go to Firebase Console
- [ ] Select your project
- [ ] Go to Firestore Database
- [ ] Click Rules tab
- [ ] Clear existing rules
- [ ] Paste development rules (from above)
- [ ] Click Publish
- [ ] Wait for "Rules updated successfully"
- [ ] Restart dev server: `npm run dev`
- [ ] Hard refresh browser: Ctrl+Shift+R
- [ ] Sign in to your app
- [ ] Test creating interview
- [ ] Check browser console - no errors!
- [ ] ✅ Done!

---

## 🚀 Next Steps

### Immediate (Now):
- [ ] Apply development rules
- [ ] Test locally
- [ ] Verify everything works

### Before Production:
- [ ] Switch to production-ready rules
- [ ] Test with proper permissions
- [ ] Set up proper user/document structure
- [ ] Enable Firestore backup

### Ongoing:
- [ ] Monitor Firestore usage
- [ ] Review security logs
- [ ] Test permission edge cases
- [ ] Update rules as needed

---

## 📞 Still Getting Error?

### Debug Steps:

1. **Check Authentication**
   ```javascript
   // In browser console
   firebase.auth().currentUser.uid
   // Should print your user ID
   ```

2. **Check Firestore Connection**
   ```javascript
   // In browser console
   db
   // Should show Firestore instance
   ```

3. **Check Rules Format**
   - No syntax errors in Rules tab
   - Rules published successfully
   - Wait 10-15 seconds for propagation

4. **Check Browser Cache**
   ```bash
   # Hard refresh
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

5. **Check Server Logs**
   ```bash
   # Look for any errors in terminal where npm run dev is running
   npm run dev
   ```

---

## 📖 Resources

- **Firestore Docs**: https://firebase.google.com/docs/firestore/security/start
- **Security Rules Reference**: https://firebase.google.com/docs/reference/rules/rules.firestore
- **Best Practices**: https://firebase.google.com/docs/firestore/security/rules-conditions

---

## 🎉 Success!

After updating rules, you should:
- ✅ Sign in without errors
- ✅ Create interviews without errors
- ✅ Save data to Firestore
- ✅ Read data from Firestore
- ✅ See feedback page after interview

**If everything works, your Firestore is now configured correctly!**

---

*Last Updated: April 6, 2026*
*Status: ✅ Ready to Use*
