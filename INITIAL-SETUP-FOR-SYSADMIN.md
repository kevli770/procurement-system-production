# Initial Setup Guide for System Administrator

## Overview

This guide explains the **ONE-TIME setup** required on the production server before you can start deploying updates.

**Time required:** 30-45 minutes
**Difficulty:** Medium
**Frequency:** Once only (when setting up for the first time)

---

## Important Notes

### ⚠️ One-Time Setup vs. Regular Deployment

- **This guide:** Initial setup (do this ONCE)
- **Regular deployments:** Use `update-production.ps1` (do this every time there's a new version)

### What's Already Configured

The deployment scripts are **pre-configured** with these defaults:

```powershell
Repository Owner: kevli770
Repository Name: procurement-system-production
Application Name: procurement
Deploy Path: C:\inetpub\procurement
Backup Path: C:\backups\procurement
```

**You only need to change these if your setup is different!**

---

## Prerequisites

Before starting, ensure you have:

- [ ] Windows Server 2019 or later
- [ ] Administrator access
- [ ] Internet connection
- [ ] At least 10GB free disk space

---

## Step-by-Step Initial Setup

### Step 1: Install Node.js

**1.1 Download Node.js:**
```
1. Open browser
2. Go to: https://nodejs.org/
3. Click: "Download Node.js (LTS)" - Version 20.x
4. Download the Windows Installer (.msi)
```

**1.2 Install Node.js:**
```
1. Run the downloaded .msi file
2. Click "Next" through the installer
3. Accept the license agreement
4. Use default installation path: C:\Program Files\nodejs\
5. Check "Automatically install necessary tools"
6. Click "Install"
7. Wait for installation to complete
8. Click "Finish"
```

**1.3 Verify Installation:**
```powershell
# Open PowerShell (as Administrator)
node --version
# Should show: v20.x.x

npm --version
# Should show: 10.x.x
```

✅ **If you see version numbers, Node.js is installed correctly!**

---

### Step 2: Install PM2

**2.1 Install PM2 Globally:**
```powershell
# Run as Administrator
npm install -g pm2

# Verify installation
pm2 --version
# Should show: 5.x.x
```

**2.2 Setup PM2 as Windows Service (Optional but Recommended):**

This ensures PM2 starts automatically when the server reboots.

```powershell
# Install pm2-windows-service
npm install -g pm2-windows-service

# Setup PM2 service
pm2-service-install

# When prompted:
# - Perform environment setup? Yes
# - PM2_HOME: C:\ProgramData\pm2\home
# - PM2_SERVICE_SCRIPTS: (leave empty)
```

✅ **PM2 is now installed and will auto-start on reboot!**

---

### Step 3: Download and Extract Initial Application

**3.1 Get the Latest Release:**
```
1. Open browser
2. Go to: https://github.com/umitgh/procurement-system/releases
3. You'll see: "v0.1.0 - Latest Release"
4. Under "Assets", click: procurement-v0.1.0.zip
5. Save to: C:\temp\procurement-v0.1.0.zip
```

**3.2 Create Application Directory:**
```powershell
# Create main directory
New-Item -ItemType Directory -Path "C:\inetpub\procurement" -Force

# Create backup directory
New-Item -ItemType Directory -Path "C:\backups\procurement" -Force
```

**3.3 Extract Application:**
```powershell
# Extract the ZIP
Expand-Archive -Path "C:\temp\procurement-v0.1.0.zip" -DestinationPath "C:\inetpub\procurement" -Force
```

✅ **Application files are now in place!**

---

### Step 4: Configure Environment Variables

**4.1 Create .env file:**
```powershell
cd C:\inetpub\procurement

# Copy the example file
Copy-Item .env.example .env

# Edit the .env file
notepad .env
```

**4.2 Update these values in .env:**

```env
# Database
DATABASE_URL="file:./prisma/procurement.db"

# Application
NODE_ENV=production
PORT=3000

# Authentication Secret (IMPORTANT: Generate a random string!)
AUTH_SECRET="generate-a-long-random-string-here-at-least-32-characters-long"

# Application URL
NEXTAUTH_URL="http://your-server-ip:3000"
# OR if using domain:
# NEXTAUTH_URL="http://procurement.yourcompany.com"

# Email Configuration (Optional - for email notifications)
SMTP_HOST="your-smtp-server.com"
SMTP_PORT=587
SMTP_USER="your-email@company.com"
SMTP_PASS="your-email-password"
SMTP_FROM="noreply@yourcompany.com"
```

**4.3 Generate AUTH_SECRET:**

You can generate a secure random string using:

**Option A - PowerShell:**
```powershell
# Generate random string
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**Option B - Online:**
```
Go to: https://generate-secret.vercel.app/32
Copy the generated string
```

✅ **Paste the generated string into .env as AUTH_SECRET value**

---

### Step 5: Initialize Database

**5.1 Install Dependencies:**
```powershell
cd C:\inetpub\procurement

# Install all required packages
npm install
```

This will take 2-5 minutes.

**5.2 Setup Database:**
```powershell
# Generate Prisma Client
npx prisma generate

# Run migrations to create database structure
npx prisma migrate deploy

# Seed initial data (creates admin user, sample data, etc.)
npx prisma db seed
```

**5.3 Note the Admin Credentials:**

After seeding, you'll see:
```
✓ Database seeded successfully!

Default admin user:
Email: admin@company.com
Password: Admin123!

⚠️ IMPORTANT: Change this password after first login!
```

✅ **Write down these credentials - you'll need them to login!**

---

### Step 6: Start the Application

**6.1 Start with PM2:**
```powershell
cd C:\inetpub\procurement

# Start the application
pm2 start ecosystem.config.js

# Check status
pm2 status
```

You should see:
```
┌────┬──────────────┬─────────┬─────────┬───────┐
│ id │ name         │ status  │ restart │ uptime│
├────┼──────────────┼─────────┼─────────┼───────┤
│ 0  │ procurement  │ online  │ 0       │ 1s    │
└────┴──────────────┴─────────┴─────────┴───────┘
```

**6.2 Save PM2 Process List:**
```powershell
# Save the process list so PM2 knows to restart it on reboot
pm2 save

# Enable startup script
pm2 startup
```

✅ **Application is now running!**

---

### Step 7: Test the Application

**7.1 Open Browser:**
```
http://localhost:3000
```

**OR from another computer:**
```
http://[server-ip]:3000
```

**7.2 Login:**
```
Email: admin@company.com
Password: Admin123!
```

**7.3 Verify:**
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] Dashboard displays correctly
- [ ] Can navigate between pages
- [ ] No errors in browser console (F12)

✅ **If everything works, initial setup is complete!**

---

### Step 8: Configure Windows Firewall (If Needed)

If you can't access the application from other computers:

```powershell
# Allow port 3000 through firewall
New-NetFirewallRule -DisplayName "Procurement App" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

### Step 9: Verify Deployment Scripts

**9.1 Check if scripts need configuration:**

```powershell
cd C:\inetpub\procurement\deployment

# Open the update script
notepad update-production.ps1
```

**9.2 Verify these settings (around line 40-45):**

```powershell
# Configuration
$ErrorActionPreference = "Stop"
$RepoOwner = "kevli770"                    # ← Should be correct already
$RepoName = "procurement-system-production" # ← Should be correct already
$AppName = "procurement"                    # ← Should match your PM2 app name
$DeployPath = "C:\inetpub\$AppName"        # ← Should match where you installed
$BackupPath = "C:\backups\$AppName"        # ← Should match your backup location
```

**If any of these are different in your setup, update them now.**

**Common customizations:**

```powershell
# Example: If you installed to a different drive
$DeployPath = "D:\apps\procurement"
$BackupPath = "D:\backups\procurement"

# Example: If you used a different app name
$AppName = "procurement-prod"

# Example: If your GitHub repo is different
$RepoOwner = "your-company"
$RepoName = "procurement"
```

**9.3 Save the file if you made changes.**

✅ **Scripts are now configured for your environment!**

---

## Summary - What's Configured Now

After completing this setup:

✅ **Software Installed:**
- Node.js 20 LTS
- PM2 (as Windows Service)
- Application dependencies

✅ **Directories Created:**
- `C:\inetpub\procurement` - Application
- `C:\backups\procurement` - Backups

✅ **Application Running:**
- Database initialized with sample data
- Admin user created
- Application accessible at http://localhost:3000
- PM2 managing the process
- Auto-start on server reboot

✅ **Deployment Ready:**
- Scripts configured
- Backup location set
- Ready for future updates

---

## Future Updates - Simple Process

Now that initial setup is complete, future updates are simple:

**When developer notifies you of a new version:**

```powershell
cd C:\inetpub\procurement\deployment
.\update-production.ps1 -Version "0.2.0"
```

**That's it!** The script handles:
- Downloading new version
- Creating backup
- Updating files
- Running database migrations
- Restarting application
- Health check
- Automatic rollback if needed

**No configuration needed each time!**

---

## Important Files and Locations

### Application:
```
C:\inetpub\procurement\           - Main application
C:\inetpub\procurement\.env       - Environment config (KEEP THIS SAFE!)
C:\inetpub\procurement\prisma\procurement.db - Database (KEEP THIS SAFE!)
```

### Backups:
```
C:\backups\procurement\           - Backup directory
C:\backups\procurement\logs\      - Deployment logs
```

### Scripts:
```
C:\inetpub\procurement\deployment\update-production.ps1  - Update script
C:\inetpub\procurement\deployment\rollback-production.ps1 - Rollback script
```

### Important: Never Delete These Files!
- ❌ `.env` - Contains all configuration
- ❌ `prisma/*.db` - Contains all your data
- ❌ `deployment/*.ps1` - Deployment scripts

---

## Troubleshooting Initial Setup

### Problem: "npm is not recognized"

**Solution:** Restart PowerShell after installing Node.js
```powershell
# Close and reopen PowerShell
# Then verify:
npm --version
```

---

### Problem: "pm2 is not recognized"

**Solution:** Install PM2 globally
```powershell
npm install -g pm2
```

---

### Problem: "Cannot bind to port 3000"

**Solution:** Port is already in use
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID 1234 /F
```

---

### Problem: Application starts but can't login

**Solution:** Check if database was seeded
```powershell
cd C:\inetpub\procurement

# Re-run seed
npx prisma db seed
```

---

### Problem: "Migration failed"

**Solution:** Database might be locked
```powershell
# Stop PM2
pm2 stop procurement

# Wait a few seconds
Start-Sleep -Seconds 5

# Run migrations
npx prisma migrate deploy

# Start PM2
pm2 start procurement
```

---

## Security Checklist

After setup, ensure:

- [ ] Changed default admin password
- [ ] `.env` file has strong AUTH_SECRET (32+ characters)
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular backups scheduled
- [ ] Only authorized personnel have server access
- [ ] `.env` file backed up securely (separate from application)

---

## Regular Maintenance

### Daily:
- Check application is running: `pm2 status`

### Weekly:
- Check logs: `pm2 logs procurement --lines 50`
- Verify backups exist: `dir C:\backups\procurement`

### Monthly:
- Clean old backups (keep last 10 versions)
- Review disk space: `Get-PSDrive C`

---

## Quick Reference - Common Commands

```powershell
# Check application status
pm2 status

# View logs
pm2 logs procurement

# Restart application
pm2 restart procurement

# Stop application
pm2 stop procurement

# Start application
pm2 start procurement

# Check disk space
Get-PSDrive C

# List backups
dir C:\backups\procurement
```

---

## What to Do When You Receive Update Notification

**Email from developer:**
```
"Version v0.2.0 is ready"
Link: https://github.com/...
```

**Your actions:**
```powershell
# Step 1: Go to deployment folder
cd C:\inetpub\procurement\deployment

# Step 2: Run update script (change version number!)
.\update-production.ps1 -Version "0.2.0"

# Step 3: Type 'yes' when prompted

# Step 4: Wait 2 minutes

# Step 5: Verify application is running
pm2 status

# Step 6: Test in browser
# http://localhost:3000

# Step 7: Reply to developer
"✅ Deployment successful!"
```

**That's it!**

---

## Need Help?

1. **Check logs:**
   ```powershell
   pm2 logs procurement
   # Or
   type C:\backups\procurement\logs\deployment-[date].log
   ```

2. **Check troubleshooting guide:**
   - See TROUBLESHOOTING.md in deployment folder

3. **Contact developer:**
   - Provide: What you were doing, error message, log files

---

## Summary

**Initial setup is a ONE-TIME process.**

After this setup:
- ✅ Application is running
- ✅ Everything is configured
- ✅ Ready for future updates

**Future updates are SIMPLE:**
```powershell
.\update-production.ps1 -Version "X.X.X"
```

**No need to edit scripts or configuration for regular updates!**

---

**Questions?** Contact the developer.

**Last Updated:** October 2025
