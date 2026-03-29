# 🚀 Quick Fix - Connect to PocketBase

## The Problem
❌ Showing fake data (PinkMilk Bubble Football, etc.)  
❌ Not loading from your PocketBase database  
❌ New entries not saving to PocketBase  

## The Solution (1 Minute Fix!)

### Step 1: Find Your PocketBase URL

Your PocketBase is probably at one of these:
- `https://pb.pinkmilk.eu`
- `https://pocketbase.pinkmilk.eu`
- `https://api.pinkmilk.eu`
- `http://localhost:8090` (if running locally)

### Step 2: Update config.js

Open `/teaminput/config.js` and change line 8:

```javascript
// BEFORE:
PB_URL: 'https://your-pocketbase-url.com',

// AFTER (example):
PB_URL: 'https://pb.pinkmilk.eu',
```

### Step 3: Set Priorities in PocketBase

In your PocketBase admin, set the priority field for the shows you want to see:

- Workshop Commercial maken → priority: 1
- Ik Hou van Holland → priority: 2  
- Ranking the Starzzz → priority: 3

**Important:** Priority 0 = hidden, Priority 1+ = visible

### Step 4: Refresh the Page

Done! Your real data will now load.

---

## What Changed

### ✅ Now Using Real PocketBase Data
- Loads from `teamx` collection
- Shows only records with priority > 0
- Saves new entries directly to PocketBase
- Updates existing records in PocketBase

### ✅ Field Mapping
| Your Form | PocketBase |
|-----------|------------|
| Show Naam | `show` |
| Notities | `playerData` |
| Hoeveel Teams | `teamnumber` |
| Players | `players` |

### ✅ Features
- Create new shows → saves to PocketBase
- Update existing shows → updates PocketBase
- Priority sorting (1, 2, 3...)
- Hide shows with priority 0

---

## Need Your PocketBase URL?

**Tell me your PocketBase URL and I'll update the config for you!**

Common formats:
- `https://pb.pinkmilk.eu`
- `https://your-domain.com:8090`
- `http://localhost:8090`

---

## Files Modified

1. ✅ `config.js` - Configuration (UPDATE THIS!)
2. ✅ `js/script.js` - PocketBase integration
3. ✅ `index.html` - Removed fake data
4. ✅ Added PocketBase SDK loading

---

**Status:** ⚠️ Waiting for PocketBase URL in config.js
