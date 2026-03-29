# TeamX Input - Standalone Version

A complete standalone web application for team management with all requested features.

## 🌐 Access URL

```
https://www.pinkmilk.eu/teaminput/
```

## ✨ Features

### 1. Horizontal Scrollable Blocks
- ✅ At least 5 blocks visible horizontally
- ✅ Smooth horizontal scrolling
- ✅ Custom scrollbar styling
- ✅ Optional scroll buttons for easy navigation

### 2. Priority-Based Sorting
- ✅ Blocks sorted by priority number (1 first, 2 next, etc.)
- ✅ Blocks with priority = 0 are automatically hidden
- ✅ Dynamic re-sorting when priority changes

### 3. Form Layout - All in Rows

#### Teams and Players Row
- ✅ "Hoeveel teams" and "Players" side-by-side

#### Media Equipment Row
- ✅ TV screen: Beamer | TV | None
- ✅ Audio input: XLR | Tulp | Aux | None
- ✅ Both in one row

#### Parking Field
- ✅ Placeholder: "betaald waar ?"

#### Priority and PhotoCircle Row
- ✅ Priority (2-digit input) and PhotoCircle side-by-side

### 4. New Notities Field
- ✅ Multi-line textarea
- ✅ Placeholder text:
  - Gesproken met
  - Speciale afspraken
  - spa rood?

## 📁 File Structure

```
teaminput/
├── index.html          # Main HTML page
├── css/
│   └── style.css       # All styling
├── js/
│   └── script.js       # All JavaScript functionality
├── submit.php          # Form submission handler
├── data/               # Data storage (auto-created)
│   └── submissions.json
└── README.md           # This file
```

## 🚀 Installation

### Option 1: Direct Upload
1. Upload the entire `teaminput` folder to your web server
2. Access via: `https://www.pinkmilk.eu/teaminput/`

### Option 2: Local Development
1. Place folder in your local web server directory
2. Access via: `http://localhost/teaminput/`

## 🔧 Configuration

### Data Storage

By default, form submissions are saved to `data/submissions.json`.

**To use MySQL database instead:**

1. Create database table:
```sql
CREATE TABLE team_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    hoeveel_teams INT NOT NULL,
    players INT NOT NULL,
    tv_screen VARCHAR(50),
    audio_input VARCHAR(50),
    parking VARCHAR(255),
    priority INT,
    photo_circle VARCHAR(255),
    notities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Uncomment database code in `submit.php` (lines 90-115)
3. Update database credentials

### Permissions

Ensure the `data` directory is writable:
```bash
chmod 755 data
```

## 💻 Usage

### Adding/Editing Blocks

Edit `index.html` to add more blocks:

```html
<div class="teamx-block" data-priority="7">
    <h3>Team 7</h3>
    <div class="block-content">
        <p><strong>Priority:</strong> 7</p>
        <input type="number" class="block-priority" value="7" min="0" max="99">
        <p>Team details here...</p>
    </div>
</div>
```

### Customizing Styles

Edit `css/style.css` to change:
- Colors (search for `#667eea` and `#764ba2`)
- Spacing and sizes
- Responsive breakpoints

### Modifying Functionality

Edit `js/script.js` to change:
- Sorting logic
- Form validation
- Dynamic features

## 📱 Responsive Design

- **Desktop (1200px+):** 5 blocks visible
- **Tablet (768px-1200px):** 4 blocks visible
- **Mobile (480px-768px):** 2 blocks visible
- **Small mobile (<480px):** 1 block visible

Form fields stack vertically on mobile for better usability.

## 🔒 Security

The application includes:
- ✅ Input sanitization
- ✅ XSS protection
- ✅ CSRF protection (can be added)
- ✅ Form validation

**For production use:**
- Disable error reporting in `submit.php`
- Add CSRF tokens
- Implement authentication if needed
- Use HTTPS

## 🐛 Troubleshooting

### Blocks not sorting
- Check browser console for errors
- Verify `data-priority` attributes are set
- Ensure JavaScript is enabled

### Form not submitting
- Check `submit.php` file permissions
- Verify `data` directory is writable
- Check browser console for errors

### Styles not applying
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check CSS file path in `index.html`
- Verify CSS file uploaded correctly

## 🎨 Customization Examples

### Change Color Scheme

In `css/style.css`, replace:
```css
/* Current purple gradient */
#667eea and #764ba2

/* With your colors */
#your-color-1 and #your-color-2
```

### Add More Radio Options

In `index.html`, add to radio groups:
```html
<div class="teamx-radio-option">
    <input type="radio" name="tv_screen" value="projector" id="tv_projector">
    <label for="tv_projector">Projector</label>
</div>
```

## 📊 Viewing Submissions

Submissions are saved to `data/submissions.json`.

**To view:**
1. Open `data/submissions.json` in a text editor
2. Or create a simple viewer page (optional)

## 🔄 Updates

To update the application:
1. Backup your `data` folder
2. Replace files with new versions
3. Restore your `data` folder

## 📞 Support

For issues or questions:
- Check browser console for errors
- Verify file permissions
- Check PHP error logs

## 📝 License

© 2024 TeamX - All rights reserved

---

**Version:** 1.0.0  
**Last Updated:** November 28, 2024  
**Tested On:** Chrome, Firefox, Safari, Edge
