# PocketBase Integration Setup

## 🔧 Quick Setup (3 Steps)

### Step 1: Update PocketBase URL

Edit `config.js` and change the PB_URL to your actual PocketBase URL:

```javascript
const CONFIG = {
    PB_URL: 'https://your-actual-pocketbase-url.com', // ← Change this!
    COLLECTION: 'teamx',
    // ... rest of config
};
```

**Where to find your PocketBase URL:**
- If hosted: Use your domain (e.g., `https://pb.pinkmilk.eu`)
- If local: Use `http://localhost:8090`

### Step 2: Verify PocketBase Collection

Make sure your PocketBase `teamx` collection has these fields:

| Field Name | Type | Notes |
|------------|------|-------|
| `show` | text | Show name |
| `teamnumber` | number | Number of teams (maps to "Hoeveel Teams") |
| `players` | number | Number of players |
| `playerData` | text | Notes/Notities field |
| `priority` | number | Priority (0 = hidden, 1+ = visible) |
| `tv_screen` | text | TV Screen info |
| `audio_input` | text | Audio input info |
| `parking` | text | Parking info |
| `photo_circle` | text | PhotoCircle info |

### Step 3: Enable CORS (if needed)

If your PocketBase is on a different domain, you may need to enable CORS.

In PocketBase admin:
1. Go to Settings → Application
2. Add your domain to allowed CORS origins

---

## 🎯 How It Works

### Loading Data
1. Page loads
2. Connects to PocketBase
3. Fetches all records from `teamx` collection where `priority > 0`
4. Creates a block for each record
5. Sorts by priority

### Creating New Show
1. Fill out "Nieuw Show" form
2. Click "Create Team"
3. Data is saved to PocketBase
4. Page reloads to show new entry
5. New entry appears in PocketBase admin

### Updating Existing Show
1. Edit any field in an existing block
2. Click "Update"
3. Changes are saved to PocketBase
4. Page reloads to show updated data

---

## 📊 Field Mapping

| Form Field | PocketBase Field | Type |
|------------|------------------|------|
| Show Naam | `show` | text |
| Notities | `playerData` | text |
| Hoeveel Teams | `teamnumber` | number |
| Players | `players` | number |
| TV Screen | `tv_screen` | text |
| Audio input | `audio_input` | text |
| Parking | `parking` | text |
| Priority | `priority` | number |
| PhotoCircle | `photo_circle` | text |

---

## 🔍 Troubleshooting

### "Failed to load PocketBase SDK"
- Check your internet connection
- CDN might be blocked

**Solution:** Download PocketBase SDK locally:
```bash
cd js
curl -o pocketbase.umd.js https://cdn.jsdelivr.net/npm/pocketbase@0.19.0/dist/pocketbase.umd.js
```

Then update `script.js` line 27:
```javascript
script.src = 'js/pocketbase.umd.js'; // Use local file
```

### "Fout bij laden van data"
- Check PocketBase URL in `config.js`
- Verify PocketBase is running
- Check browser console for errors

### "CORS Error"
- Enable CORS in PocketBase settings
- Add your domain to allowed origins

### No data showing
- Check that records have `priority > 0`
- Records with `priority = 0` are hidden
- Check browser console for errors

### New entries not appearing in PocketBase
- Check PocketBase admin panel
- Verify collection name is correct (`teamx`)
- Check field names match

---

## 🧪 Testing

### Test 1: Load Data
1. Open page
2. Should see "X shows geladen" message
3. Should see blocks for each show with priority > 0

### Test 2: Create New Show
1. Fill out "Nieuw Show" form
2. Enter show name: "Test Show"
3. Click "Create Team"
4. Should see "Show succesvol aangemaakt!"
5. Check PocketBase admin - new entry should appear

### Test 3: Update Show
1. Edit any field in existing block
2. Click "Update"
3. Should see "Show bijgewerkt!"
4. Check PocketBase admin - changes should be saved

---

## 📝 Current PocketBase Data

Based on your screenshot, you have:

1. **Workshop Commercial maken - Utrecht**
   - Teams: 4
   - Players: 40

2. **Ik Hou van Holland - De kromme Toeter**
   - Teams: 6
   - Players: 42

3. **Ranking the Starzzz - Voorthuizen**
   - Teams: 4
   - Players: 16

These will automatically appear in the interface once you:
1. Set their `priority` to 1, 2, 3 (not 0)
2. Update the PB_URL in `config.js`

---

## ✅ Checklist

- [ ] Updated `config.js` with correct PB_URL
- [ ] Verified PocketBase collection fields
- [ ] Set priority > 0 for records you want to see
- [ ] Tested loading data
- [ ] Tested creating new show
- [ ] Tested updating existing show
- [ ] Checked PocketBase admin for changes

---

## 🚀 Next Steps

1. **Update config.js** with your PocketBase URL
2. **Set priorities** in PocketBase (1, 2, 3, etc.)
3. **Refresh the page** - your real data will load!
4. **Test creating** a new show
5. **Verify in PocketBase** that it was saved

---

**Need help?** Check the browser console (F12) for error messages.
