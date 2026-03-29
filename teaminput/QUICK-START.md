# 🚀 TeamX Input - Quick Start Guide

## Immediate Access

**URL:** `https://www.pinkmilk.eu/teaminput/`

The standalone application is ready to use immediately!

---

## ✅ What's Included

### All Requirements Implemented:

1. **✅ Horizontal Scrollable Blocks**
   - At least 5 blocks visible
   - Sorted by priority (1, 2, 3...)
   - Priority 0 blocks are hidden

2. **✅ Form Fields in Rows:**
   - Hoeveel teams | Players (one row)
   - TV screen | Audio input (one row)
   - Priority | PhotoCircle (one row)

3. **✅ New Notities Field**
   - Multi-line textarea
   - Placeholder: "Gesproken met / Speciale afspraken / spa rood?"

4. **✅ All Placeholders Updated**
   - Parking: "betaald waar ?"

---

## 📁 File Structure

```
teaminput/
├── index.html          ← Main page (open this)
├── css/
│   └── style.css       ← All styling
├── js/
│   └── script.js       ← All functionality
├── submit.php          ← Form handler
├── view-data.php       ← Data viewer (password: teamx2024)
├── .htaccess           ← Security & config
└── data/               ← Auto-created for storage
    └── submissions.json
```

---

## 🎯 Quick Actions

### 1. Test the Application
```
Open: https://www.pinkmilk.eu/teaminput/
```

### 2. View Submitted Data
```
Open: https://www.pinkmilk.eu/teaminput/view-data.php
Password: teamx2024
```

### 3. Customize Colors
Edit `css/style.css` and search for:
- `#667eea` (purple)
- `#764ba2` (darker purple)

Replace with your brand colors.

### 4. Add More Blocks
Edit `index.html` around line 30 and add:
```html
<div class="teamx-block" data-priority="7">
    <h3>Team 7</h3>
    <div class="block-content">
        <p><strong>Priority:</strong> 7</p>
        <input type="number" class="block-priority" value="7" min="0" max="99">
        <p>Your content here...</p>
    </div>
</div>
```

---

## 🔧 Configuration

### Change Data Viewer Password
Edit `view-data.php` line 10:
```php
$password = 'your-new-password';
```

### Enable Database Storage
1. Uncomment lines 90-115 in `submit.php`
2. Update database credentials
3. Create table (SQL provided in README.md)

---

## 📱 Mobile Responsive

- **Desktop:** 5 blocks visible
- **Tablet:** 4 blocks visible  
- **Mobile:** 2 blocks visible
- **Small screens:** 1 block visible

All form fields stack vertically on mobile.

---

## ⚡ Features

### Automatic Features:
- ✅ Block sorting by priority
- ✅ Hide priority 0 blocks
- ✅ Form validation
- ✅ Success messages
- ✅ Smooth scrolling
- ✅ Responsive design

### Optional Features:
- Scroll buttons (auto-added if needed)
- Data export (can be added)
- Email notifications (can be added)

---

## 🔒 Security

**Current Setup:**
- ✅ Input sanitization
- ✅ XSS protection
- ✅ Data directory protection
- ✅ Password-protected data viewer

**For Production:**
1. Change data viewer password
2. Add HTTPS (if not already)
3. Consider adding CSRF tokens
4. Review file permissions

---

## 🐛 Troubleshooting

### Form not submitting?
1. Check browser console (F12)
2. Verify `data` folder is writable: `chmod 755 data`
3. Check PHP error logs

### Blocks not sorting?
1. Verify `data-priority` attributes exist
2. Check browser console for JavaScript errors
3. Clear cache and reload

### Styles not loading?
1. Clear browser cache (Ctrl+F5 / Cmd+Shift+R)
2. Check file paths in `index.html`
3. Verify CSS file uploaded correctly

---

## 📊 Data Management

### View Data:
```
https://www.pinkmilk.eu/teaminput/view-data.php
```

### Export Data:
Download `data/submissions.json` via FTP/cPanel

### Backup Data:
```bash
cp data/submissions.json data/submissions-backup-$(date +%Y%m%d).json
```

---

## 🎨 Customization Examples

### Change Button Color
In `css/style.css` (line 270):
```css
.teamx-submit-btn {
    background: linear-gradient(135deg, #YOUR-COLOR-1 0%, #YOUR-COLOR-2 100%);
}
```

### Add More Form Fields
In `index.html`, add before submit button:
```html
<div class="teamx-form-field">
    <label for="new_field">New Field:</label>
    <input type="text" id="new_field" name="new_field">
</div>
```

### Change Number of Visible Blocks
In `css/style.css` (line 57):
```css
.teamx-block {
    min-width: calc(20% - 16px); /* 5 blocks */
    /* Change to calc(16.66% - 16px) for 6 blocks */
}
```

---

## ✨ Next Steps

1. **Test everything:** Open the URL and test all features
2. **Customize:** Update colors and content to match your brand
3. **Secure:** Change the data viewer password
4. **Monitor:** Check `data/submissions.json` for entries

---

## 📞 Need Help?

- Check browser console (F12) for errors
- Review `README.md` for detailed documentation
- Check PHP error logs on server
- Verify file permissions

---

**Status:** ✅ Ready to use!  
**Version:** 1.0.0  
**Access:** https://www.pinkmilk.eu/teaminput/

---

## 🎉 You're All Set!

The application is **fully functional** and ready to use. All your requirements have been implemented:

- ✅ Horizontal scrollable blocks (5+ visible)
- ✅ Priority sorting (1, 2, 3...)
- ✅ Hide priority 0 blocks
- ✅ All form fields in rows as requested
- ✅ New Notities field with placeholder
- ✅ All placeholders updated
- ✅ Responsive design
- ✅ Form submission handling
- ✅ Data viewer included

**Just upload and use!** 🚀
