# Deployment Workflow - Quick Summary

## 🎯 The Complete Process

### 👨‍💻 **Developer (You)**

#### When you're ready to deploy:

**Just tell me:**
> "Ready for production"

**Or:**
> "Create a new release"

**Or:**
> "Deploy version X.X.X"

#### I will automatically:

```bash
npm run release:minor
```

This will:
- ✅ Update package.json (0.1.0 → 0.2.0)
- ✅ Create git tag (v0.2.0)
- ✅ Commit changes
- ✅ Push to GitHub (including tags)

**Done! ☕ Wait 5 minutes.**

---

### 🤖 **GitHub Actions (Automatic - 5 minutes)**

When GitHub sees the new tag, it automatically:

```
✓ npm install
✓ npm run build
✓ Create optimized ZIP package
✓ Create GitHub Release
✓ Attach ZIP to release
✓ Generate release notes
```

**You can monitor progress:**
```bash
gh run list --limit 1
```

Or visit: https://github.com/umitgh/procurement-system/actions

---

### 📧 **You Notify System Administrator**

Send this message:

```
Subject: New Version Ready - v0.2.0

Hi,

Version v0.2.0 is ready for production deployment!

Changes:
- Added phone field to suppliers
- Fixed validation bug

Release: https://github.com/umitgh/procurement-system/releases/tag/v0.2.0

To deploy, run:
.\update-production.ps1 -Version "0.2.0"

Database changes:
✓ Safe schema updates only
✓ All existing data will be preserved

Estimated downtime: 2 minutes

Please confirm when deployment is complete.

Thanks!
```

---

### 👨‍💼 **System Administrator (On Production Server)**

#### Step 1: Review Release
- Go to: https://github.com/umitgh/procurement-system/releases
- Read what changed
- Check database migration notes

#### Step 2: Connect to Server
```
RDP → Windows Server
```

#### Step 3: Run Deployment
```powershell
cd C:\inetpub\procurement\deployment
.\update-production.ps1 -Version "0.2.0"
```

Type: `yes` when prompted

#### Step 4: Wait (~2 minutes)
The script automatically:
- ✅ Creates backup
- ✅ Downloads new version
- ✅ Updates files (preserves .env and database!)
- ✅ Runs database migrations
- ✅ Restarts application
- ✅ Performs health check
- ✅ Auto-rollback if anything fails

#### Step 5: Verify
```powershell
pm2 status
# Should show: online

pm2 logs procurement
# Check for errors

# Open browser: http://localhost:3000
# Test the application
```

#### Step 6: Confirm
Reply to your email:
```
✅ Deployment successful!
Version v0.2.0 is now running.
Status: online
Issues: None
```

---

## 📊 Timeline

| Step | Who | Time |
|------|-----|------|
| 1. Code ready | You | - |
| 2. Create release | You (tell Claude) | 10 seconds |
| 3. GitHub Actions | Automatic | 5 minutes |
| 4. Deploy to server | Sysadmin | 2 minutes |
| **Total** | | **~7 minutes** |
| **Downtime** | | **~2 minutes** |

---

## 🔄 If Something Goes Wrong

### Automatic Rollback
If the health check fails, the script automatically restores the previous version.

**No action needed!**

### Manual Rollback
If you discover issues later:

```powershell
.\rollback-production.ps1 -ToVersion "0.1.0"
```

**Time: 1 minute**

---

## 📝 Version Numbering

When you say "ready for production", I'll choose:

- **patch** (0.1.0 → 0.1.**1**) - Small bug fix
- **minor** (0.1.0 → 0.**2**.0) - New feature (most common)
- **major** (0.1.0 → **1**.0.0) - Breaking change / major update

You can also specify:
> "Create a major release" → I'll run `npm run release:major`

---

## ✅ Checklist

### Before Release:
- [ ] All features tested locally
- [ ] Build succeeds (`npm run build`)
- [ ] Database migrations created (if needed)
- [ ] Ready to deploy

### After Release:
- [ ] GitHub Actions completed successfully
- [ ] ZIP file available in Releases
- [ ] System administrator notified
- [ ] Deployment confirmed successful

---

## 🎯 Example Conversation

**You:**
> "Finished adding the phone field to suppliers. Everything works locally. Ready for production."

**Me (Claude):**
> "Great! Creating release v0.2.0..."
>
> ```bash
> npm run release:minor
> ```
>
> ✅ Version v0.2.0 created!
>
> GitHub Actions is building the release... (5 minutes)

**(5 minutes later)**

**Me:**
> ✅ Release v0.2.0 is ready!
>
> 📦 https://github.com/umitgh/procurement-system/releases/tag/v0.2.0
>
> You can notify the system administrator to deploy.

**You send to sysadmin:**
> (Email from template above)

**(Sysadmin runs script - 2 minutes)**

**Sysadmin replies:**
> ✅ Deployment complete! v0.2.0 is running.

**Done! 🎉**

---

## 📚 Documentation

### For You (Developer):
- **[GETTING-STARTED-FOR-DEVELOPER.md](GETTING-STARTED-FOR-DEVELOPER.md)** - How to get started
- **[QUICK-START.md](QUICK-START.md)** - 2-minute guide
- **[DATABASE-MIGRATIONS-EXPLAINED.md](DATABASE-MIGRATIONS-EXPLAINED.md)** - Why data is safe

### For System Administrator:
- **[DEPLOYMENT-GUIDE-FOR-SYSADMIN.md](DEPLOYMENT-GUIDE-FOR-SYSADMIN.md)** - Complete deployment guide
- **[deployment/update-production.ps1](deployment/update-production.ps1)** - Update script
- **[deployment/rollback-production.ps1](deployment/rollback-production.ps1)** - Rollback script
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues

### For Organization (SOP):
- **[DEPLOYMENT-PROCESS.md](DEPLOYMENT-PROCESS.md)** - Complete process (reusable for other apps)

---

## 🔗 Quick Links

| Resource | Link |
|----------|------|
| **Repository** | https://github.com/umitgh/procurement-system |
| **Releases** | https://github.com/umitgh/procurement-system/releases |
| **Actions** | https://github.com/umitgh/procurement-system/actions |

---

## 💡 Pro Tips

### For Faster Deployments:
1. Keep the sysadmin informed about upcoming releases
2. Schedule deployments during low-usage hours
3. Test thoroughly before creating a release
4. Always read the release notes before deploying

### For Safety:
1. Never skip backups (script does this automatically)
2. Always verify after deployment
3. Keep recent backups for at least 30 days
4. Test rollback procedure periodically

---

## ❓ FAQs

**Q: Can I deploy directly without telling you?**

A: Yes! Just run `npm run release:minor` yourself. But it's easier to tell me so I can handle everything.

---

**Q: What if I want to test the release before production?**

A: You can download the ZIP from GitHub Releases and test it on a staging server first.

---

**Q: Can I skip versions?**

A: Yes, but not recommended. Sequential versions make tracking easier.

---

**Q: What happens to the old repository (procurement-system)?**

A: It remains unchanged. You can:
- Keep it as an archive
- Delete it (after verifying the new one works)
- Continue using both

---

**Q: Can I undo a release?**

A: The tag and release will stay on GitHub (for history), but you can rollback the production deployment anytime.

---

## 🎉 That's It!

**Simple workflow:**
1. You develop
2. You say "ready"
3. I create release
4. GitHub builds it
5. Sysadmin deploys
6. Done!

**Questions?** Just ask! 😊

---

**Last Updated:** October 2025
