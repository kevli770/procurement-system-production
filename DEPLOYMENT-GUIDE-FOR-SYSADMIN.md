# Deployment Guide for System Administrator

## Overview

This guide explains how to deploy new versions of the Procurement System to the production Windows Server.

**Key Points:**
- ✅ **Automated deployment** - One PowerShell script does everything
- ✅ **Safe updates** - Automatic backup before every update
- ✅ **Database safety** - Your data is never deleted (only schema updates)
- ✅ **Automatic rollback** - If something fails, automatic recovery
- ✅ **Manual rollback** - Revert to any previous version in 1 minute

---

## Prerequisites

### On Production Server:
- Windows Server 2019 or later
- Node.js 20 LTS installed
- PM2 installed globally (`npm install -g pm2`)
- PowerShell 5.1 or later
- Internet connection (to download releases from GitHub)
- Application currently running at: `C:\inetpub\procurement`

---

## Complete Deployment Process

### Step 1: Notification from Developer

You will receive a message like:
```
"New version v0.2.0 is ready for production!

Changes:
- Added phone field to suppliers
- Fixed validation bug

Download:
https://github.com/umitgh/procurement-system/releases

To deploy, run:
.\update-production.ps1 -Version "0.2.0"
```

---

### Step 2: Review the Release (Optional but Recommended)

**Open your web browser:**
1. Go to: https://github.com/umitgh/procurement-system/releases
2. You'll see:

```
📦 v0.2.0 - Latest Release
Published 5 minutes ago

What's Changed:
• Added phone field to suppliers
• Fixed validation bug in purchase orders

Database Changes:
✓ This version includes Prisma migrations
✓ Your existing data will be preserved
✓ Only the database structure will be updated

Assets:
📎 procurement-v0.2.0.zip (45 MB)

Deployment Instructions:
Run: .\update-production.ps1 -Version "0.2.0"
```

**Review the changes** to understand what's new.

---

### Step 3: Connect to Production Server

```
1. Open Remote Desktop Connection (RDP)
2. Connect to your Windows Server
3. Login with your credentials
```

---

### Step 4: Run the Update Script

**Open PowerShell as Administrator:**

```powershell
# Navigate to deployment folder
cd C:\inetpub\procurement\deployment

# Run the update script
.\update-production.ps1 -Version "0.2.0"
```

**The script will ask for confirmation:**
```powershell
=========================================
  Procurement System - Update Script
=========================================
Version: v0.2.0
Deploy Path: C:\inetpub\procurement
Backup Path: C:\backups\procurement
=========================================

You are about to deploy version v0.2.0 to production.
Continue? (yes/no):
```

**Type:** `yes` and press Enter

---

### Step 5: Automated Update Process (~2 minutes)

The script will automatically perform these steps:

```powershell
--- Pre-flight Checks ---
✓ PM2 is available
✓ Application is running

--- Downloading Release ---
Downloading v0.2.0...
✓ Downloaded: 45 MB

--- Creating Backup ---
Creating backup...
✓ Backed up to: C:\backups\procurement\v0.1.0-20251026-153020
✓ Database backed up
✓ All files backed up

--- Deploying New Version ---
Stopping application...
✓ PM2 stopped

Extracting package...
✓ Files updated
✓ .env file preserved (not replaced!)
✓ procurement.db preserved (not replaced!)

--- Running Database Migrations ---
Running migrations...
⚙ Applying migration: 20251026_add_supplier_phone
✓ ALTER TABLE Supplier ADD COLUMN phone TEXT;
✓ Migrations completed successfully

--- Starting Application ---
Starting application...
✓ PM2 started
✓ Application is running

--- Health Check ---
Performing health check...
✓ Health check passed!

--- Cleanup ---
Cleaning temporary files...
✓ Cleanup complete

=========================================
 DEPLOYMENT SUCCESSFUL!
=========================================
Version: v0.2.0
Backup: C:\backups\procurement\v0.1.0-20251026-153020
Log: C:\backups\procurement\logs\deployment-20251026-153020.log
=========================================
```

**Total time: ~2 minutes**

---

### Step 6: Verify the Update

**Check application status:**
```powershell
pm2 status
```

You should see:
```
┌────┬──────────────┬─────────┬─────────┬───────┐
│ id │ name         │ status  │ restart │ uptime│
├────┼──────────────┼─────────┼─────────┼───────┤
│ 0  │ procurement  │ online  │ 0       │ 1m    │
└────┴──────────────┴─────────┴─────────┴───────┘
```

**Check logs:**
```powershell
pm2 logs procurement --lines 20
```

**Test the application:**
1. Open browser
2. Navigate to: `http://localhost:3000` (or your server IP)
3. Login and verify:
   - Application loads correctly
   - New features work as expected
   - Existing data is intact

---

### Step 7: Notify Developer

Send a message:
```
✅ Deployment completed successfully!

Version: v0.2.0
Status: online
Time: 2 minutes
Issues: None

The phone field is now visible in the suppliers page.
All existing data is preserved.
```

---

## If Something Goes Wrong - Rollback

### Automatic Rollback

If the health check fails, the script will **automatically rollback** to the previous version:

```powershell
--- Health Check ---
❌ Health check failed after 6 attempts
⚠ Initiating automatic rollback...

--- Rolling Back ---
Stopping application...
Removing failed deployment...
Restoring backup from: C:\backups\procurement\v0.1.0-20251026-153020
Starting application...
✓ Rollback completed successfully

The old version (v0.1.0) is now running.
```

**No action needed from you!**

---

### Manual Rollback

If you discover an issue later (hours/days after deployment):

```powershell
cd C:\inetpub\procurement\deployment

# Run rollback script
.\rollback-production.ps1 -ToVersion "0.1.0"
```

**The script will ask:**
```powershell
Available backups:
  [1] v0.1.0 - 2025-10-25 14:00 - 42.3 MB
  [2] v0.0.9 - 2025-10-24 10:00 - 41.8 MB

Selected backup: v0.1.0-20251025-140000

=========================================
  ROLLBACK OPERATION
=========================================
Target: v0.1.0-20251025-140000
Created: 2025-10-25 14:00
=========================================

WARNING: This will replace your current deployment!
Are you sure you want to continue? (yes/no):
```

**Type:** `yes`

```powershell
[1/4] Stopping application...
✓ Application stopped

[2/4] Removing current deployment...
✓ Current deployment removed

[3/4] Restoring backup...
✓ Backup restored (including database!)

[4/4] Starting application...
✓ Application started

=========================================
 ROLLBACK SUCCESSFUL!
=========================================
Restored version: v0.1.0
Application status: online
=========================================
```

**Time: 1 minute**

---

## Database Safety - Important!

### What Happens to the Database?

**✅ Your data is SAFE!**

When updating, Prisma Migrations only update the **structure** of the database, not the **data**:

**What DOES happen:**
- ✅ `ALTER TABLE` - Add new columns
- ✅ `CREATE TABLE` - Add new tables
- ✅ `CREATE INDEX` - Add new indexes

**What NEVER happens:**
- ❌ `DROP DATABASE` - Delete database
- ❌ `DELETE FROM` - Delete data
- ❌ `TRUNCATE TABLE` - Empty tables
- ❌ `DROP TABLE` - Delete tables

**Example:**

Before update:
```
Suppliers table:
┌────┬──────────┬──────────────┐
│ id │ name     │ email        │
├────┼──────────┼──────────────┤
│ 01 │ Acme Inc │ acme@test.com│ ← Existing data
│ 02 │ Beta Ltd │ beta@test.com│ ← Existing data
└────┴──────────┴──────────────┘
```

After update (added "phone" field):
```
Suppliers table:
┌────┬──────────┬──────────────┬───────┐
│ id │ name     │ email        │ phone │
├────┼──────────┼──────────────┼───────┤
│ 01 │ Acme Inc │ acme@test.com│ NULL  │ ← Data preserved!
│ 02 │ Beta Ltd │ beta@test.com│ NULL  │ ← Data preserved!
└────┴──────────┴──────────────┴───────┘
```

**Your existing data is exactly as it was!**

### Three Layers of Protection:

1. **Prisma Migrations** - Only safe structure changes
2. **Automatic Backup** - Full backup before every update
3. **Rollback Capability** - Restore previous version anytime

---

## Common Scenarios

### Scenario 1: Normal Update (Everything Works)

```
Notification → Review Changes → Connect to Server →
Run Script → Wait 2 minutes → Verify → Done! ✅
```

**Time:** 5 minutes total (2 minutes downtime)

---

### Scenario 2: Update Fails Health Check

```
Run Script → Automatic backup → Deploy → Health check fails →
Automatic rollback → Old version restored ✅
```

**Time:** 3 minutes (automatic recovery)

---

### Scenario 3: Issue Discovered After 1 Hour

```
Notice problem → Run rollback script → Wait 1 minute →
Old version restored ✅
```

**Time:** 2 minutes (manual rollback)

---

## Troubleshooting

### Problem: "PM2 is not available"

**Solution:**
```powershell
# Install PM2
npm install -g pm2

# Verify
pm2 --version
```

---

### Problem: "Failed to download release"

**Solution 1 - Check internet connection:**
```powershell
Test-NetConnection github.com -Port 443
```

**Solution 2 - Manual download:**
1. On another computer with internet:
   - Go to GitHub Releases
   - Download `procurement-vX.X.X.zip`
2. Copy to USB drive
3. On server:
   - Copy ZIP to `C:\temp\`
   - Contact developer to modify script

---

### Problem: "Health check failed"

**Solution:**
```powershell
# Check logs
pm2 logs procurement --lines 50

# Check if port is available
netstat -ano | findstr :3000

# Check .env file exists
type C:\inetpub\procurement\.env

# If needed, restart manually
pm2 restart procurement
```

---

### Problem: "Database is locked"

**Solution:**
```powershell
# Stop application
pm2 stop procurement

# Wait 5 seconds
Start-Sleep -Seconds 5

# Try again
cd C:\inetpub\procurement
npx prisma migrate deploy

# Start application
pm2 start procurement
```

---

## Important Notes

### Before Each Update:

- ✅ Ensure you have at least **5GB free disk space**
- ✅ Verify current application is running properly
- ✅ Read the release notes
- ✅ Ensure you have time for rollback if needed
- ✅ **Avoid updates on Friday evening!**

### After Each Update:

- ✅ Check `pm2 status` → should show "online"
- ✅ Open the application in browser
- ✅ Verify no errors in logs
- ✅ Test key functionality
- ✅ Confirm data is intact

### Backup Information:

- **Location:** `C:\backups\procurement\`
- **Retention:** Last 10 versions
- **Contents:** Full application + database
- **Automatic cleanup:** Old backups removed automatically

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| **Deploy new version** | `.\update-production.ps1 -Version "X.X.X"` |
| **Rollback to previous** | `.\rollback-production.ps1 -ToVersion "X.X.X"` |
| **Check application status** | `pm2 status` |
| **View logs** | `pm2 logs procurement` |
| **Restart application** | `pm2 restart procurement` |
| **Stop application** | `pm2 stop procurement` |
| **Start application** | `pm2 start procurement` |
| **List backups** | `dir C:\backups\procurement` |

---

## Contact Information

### If You Need Help:

1. **Check troubleshooting section** above
2. **Check logs:** `C:\backups\procurement\logs\`
3. **Contact developer** with:
   - What were you trying to do?
   - What happened?
   - Error messages
   - Log files

### Useful Links:

- **Releases:** https://github.com/umitgh/procurement-system/releases
- **Actions:** https://github.com/umitgh/procurement-system/actions
- **Troubleshooting:** See TROUBLESHOOTING.md in deployment folder

---

## Summary

**Deployment is simple:**

1. **Receive notification** from developer
2. **Review release notes** on GitHub
3. **Run update script:** `.\update-production.ps1 -Version "X.X.X"`
4. **Wait 2 minutes** while script does everything
5. **Verify** application is running
6. **Notify developer** of success

**If anything fails:**
- Automatic rollback handles most issues
- Manual rollback takes 1 minute
- All your data is always safe

**Questions?** Contact the developer.

---

**Last Updated:** October 2025
**Version:** 1.0
