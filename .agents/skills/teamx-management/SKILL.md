---
name: teamx-management
description: Detailed guidelines for managing, developing, and deploying the TeamX registration and dashboard application on pinkmilk.eu.
---

# TeamX Management & Deployment Guide

This skill guides you through the architecture, development rules, and deployment procedures for the **TeamX Registration & Dashboard system**.

## 🏗️ Architecture & Directories

The project is a pure static HTML, CSS, and vanilla JS application with a PHP-friendly routing configuration for Vercel deployment, but it is primarily served via FTP on Hostslim.

- **`phone/`**: The registration portal for mobile players.
- **`teams/`**: The large-screen scoreboard display showing teams and players.
- **`teaminput/`**: The admin page for creating shows, managing teams, and writing notes.
- **`config.js`**: Located inside each folder; configures URLs and variables.

---

## 🗄️ PocketBase Integration

We use **PocketBase** as our backend database (specifically `https://pb.pinkmilk.eu`).

### Critical Compatibility Rules (version 0.39)
The PocketBase server runs on **version 0.39** (which uses v0.23.0+ rules). Consequently:
1. **SDK Version**: Always load PocketBase JS SDK **v0.22.0** or newer in client scripts:
   ```html
   <script src="https://unpkg.com/pocketbase@0.22.0/dist/pocketbase.umd.js"></script>
   ```
2. **Admin Authentication**: Do NOT use `pb.admins.authWithPassword`. Admins are now part of the unified `_superusers` collection. Authenticate using:
   ```javascript
   await pb.collection("_superusers").authWithPassword(email, password);
   ```

---

## 🚀 Deployment Workflow

Any changes must be deployed in two steps:

### 1. Version Control (GitHub)
Commit all modifications and push them to the GitHub repository:
```bash
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

### 2. Live Upload (FTP)
The live application is hosted on `pinkmilk.eu`. Files must be uploaded to the server via FTP:
- **FTP Host**: `103.214.6.202`
- **FTP Port**: `21`
- **FTP User**: `dukowaeu`
- **FTP Remote Path**: `/domains/pinkmilk.eu/public_html/`
  - `phone/` -> `/domains/pinkmilk.eu/public_html/phone/`
  - `teams/` -> `/domains/pinkmilk.eu/public_html/teams/`
  - `teaminput/` -> `/domains/pinkmilk.eu/public_html/teaminput/`

You can use the helper script or write a Python FTP script to automate this transfer.
