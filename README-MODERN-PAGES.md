# 🎯 TeamX Modern Pages

Modern, responsive implementations of the TeamX registration and display system.

---

## 📁 Folder Structure

```
/Users/mac/GitHubLocal/teamx/
├── phone/              # Mobile registration page
│   ├── index.html     # Main HTML structure
│   ├── style.css      # Modern gradient styles
│   ├── config.js      # PocketBase configuration
│   └── script.js      # Registration logic
│
├── teams/              # Large screen team display
│   ├── index.html     # Main HTML structure
│   ├── style.css      # Animated gradient background
│   ├── config.js      # Shared configuration
│   └── script.js      # Real-time display logic
│
└── teaminput/          # Admin input page (existing)
```

---

## 🎨 Features

### Phone Registration (`/phone`)
- **Modern gradient background** with glassmorphism effects
- **Smooth animations** for team reveal
- **Duplicate name handling** with modal
- **Sound effects** for interactions
- **Mobile-optimized** responsive design
- **Real-time validation** and feedback

### Team Display (`/teams`)
- **Animated rainbow gradient** background (35s cycle)
- **Real-time updates** via PocketBase subscriptions
- **Fullscreen mode** (press 'F')
- **QR code** for easy mobile registration
- **Smooth animations** for new players
- **Live status indicator** with pulse effect
- **Auto-refresh** every 10 seconds as backup

---

## 🚀 Quick Setup

### 1. Upload Files
Upload the entire folders to your server:
```
/phone → https://www.pinkmilk.eu/teamx/phone/
/teams → https://www.pinkmilk.eu/teamx/teams/
```

### 2. Set Active Show
In PocketBase or the input page, set a show's priority to **5** to make it active.

### 3. Access Pages
- **Phone Registration**: `https://www.pinkmilk.eu/teamx/phone/`
- **Team Display**: `https://www.pinkmilk.eu/teamx/teams/`

---

## ⚙️ Configuration

Both pages share the same configuration in `config.js`:

```javascript
PB_URL: 'https://pinkmilk.pockethost.io'  // PocketBase instance
ACTIVE_PRIORITY: 5                         // Show with priority 5 is active
REFRESH_INTERVAL: 10000                    // 10 second backup refresh
```

---

## 🎮 Keyboard Shortcuts

### Teams Display
- **F** - Toggle fullscreen mode
- **R** - Manual refresh
- **ESC** - Exit fullscreen

---

## 📱 Mobile Features

### Phone Page
- Optimized for mobile devices
- Large touch targets
- Smooth animations
- Sound feedback
- Auto-keyboard on load

### Teams Page (Mobile)
- QR code hidden on small screens
- Vertical team layout
- Touch-friendly interface

---

## 🔄 How It Works

### Registration Flow
1. User enters name on phone
2. System checks for duplicates
3. Assigns random player number
4. Assigns to team with least players
5. Shows team number with animation
6. Updates display in real-time

### Display Flow
1. Loads show with priority = 5
2. Subscribes to player updates
3. Updates display when new players join
4. Shows animation for new players
5. Auto-refreshes every 10 seconds

---

## 🎨 Visual Features

### Phone Page
- **Gradient background**: Purple to blue gradient
- **Glassmorphism**: Frosted glass effect on container
- **Button animations**: Scale and shadow on hover
- **Team circle**: Animated reveal with rotation
- **Modal**: Dark red gradient for warnings

### Teams Page
- **Rainbow gradient**: 6-color animated background
- **Team circles**: Hover effects with shine animation
- **Player slots**: Gradient backgrounds with hover effects
- **New player animation**: Pop-in with rotation
- **Status indicator**: Pulsing green dot

---

## 🛠️ Troubleshooting

### No Show Appears
- Check that a show has `priority = 5`
- Ensure `teamnumber > 0`
- Verify PocketBase is accessible

### Real-time Updates Not Working
- Check browser console for errors
- Verify PocketBase subscriptions are enabled
- Fallback to 10-second refresh still works

### QR Code Issues
- Ensure URL in config matches your domain
- QR links to: `https://www.pinkmilk.eu/teamx`

---

## 📊 PocketBase Collections

### teamx (Shows)
- `show` - Show name
- `priority` - Set to 5 for active show
- `teamnumber` - Number of teams
- `players` - Total players expected

### allplayers (Players)
- `show` - Links to teamx.id
- `naam` - Player name
- `teamnr` - Team assignment
- `playernr` - Unique player number

---

## 🔐 Security

- Admin credentials in config (consider environment variables for production)
- PocketBase authentication required
- No direct database access from client
- Sanitized user inputs

---

## 🚦 Status Indicators

- **Green (Live)** - Connected and receiving updates
- **Orange (Refreshing)** - Manual refresh in progress
- **Red (Offline)** - Connection issues

---

## 📝 Notes

- Both pages use the same PocketBase instance
- Priority system allows quick show switching
- Modern CSS with animations and transitions
- Fully responsive design
- No jQuery or heavy frameworks - vanilla JavaScript
- Compatible with modern browsers (ES6+)

---

## 🎯 Next Steps

1. **Test** both pages with a live show
2. **Adjust** animations/colors to preference
3. **Monitor** performance with many players
4. **Consider** adding more sound effects
5. **Implement** team statistics/summaries

---

## 💡 Tips

- Use a large screen/projector for teams display
- Provide QR code printouts at venue
- Test sound effects before event
- Have backup manual registration ready
- Monitor PocketBase performance during event

---

Created with modern web standards and best practices for a smooth, engaging user experience!
