# Ban Sync Plugin - Quick Installation Guide

## Quick Start (5 Minutes)

### Step 1: Install Plugin Files

The plugin consists of these files:

```
fm-dx-webserver/
└── plugins/
    ├── BanSyncPlugin.js              # Main plugin config
    └── BanSyncPlugin/
        ├── BanSyncPlugin_server.js   # Server-side logic
        ├── frontend.js               # UI integration
        ├── README.md                 # Full documentation
        └── INSTALL.md                # This file
```

✅ All files should already be in place if you extracted the plugin correctly.

### Step 2: Enable the Plugin

Edit your `config.json` file (in the root of your FM-DX Webserver installation):

**If you have NO plugins enabled yet:**

```json
{
  "plugins": [
    "BanSyncPlugin/BanSyncPlugin_server.js"
  ]
}
```

**If you already have plugins enabled:**

Add `"BanSyncPlugin/BanSyncPlugin_server.js"` to the existing array:

```json
{
  "plugins": [
    "AudioRec/recorder.js",
    "ButtonPresets/pluginButtonPresets.js",
    "BanSyncPlugin/BanSyncPlugin_server.js"
  ]
}
```

### Step 3: Restart the Server

Stop and restart your FM-DX Webserver:

```bash
# Windows
Ctrl+C (to stop)
node index.js (to start)

# Linux
Ctrl+C (to stop)
node index.js (to start)

# Or if using a process manager
pm2 restart fm-dx-webserver
```

### Step 4: Verify Installation

Look for these messages in the console:

```
[BanSyncPlugin] Initializing Ban Sync Plugin...
[BanSyncPlugin] Created config folder
[BanSyncPlugin] Downloading ban database from GitHub...
[BanSyncPlugin] Successfully downloaded ban database
[BanSyncPlugin] Loaded X synced ban entries
[BanSyncPlugin] Ban Sync Plugin initialized successfully
```

✅ If you see these messages, the plugin is working!

### Step 5: Access the UI

1. Open your webserver in a browser
2. Log in as admin
3. Go to **Setup** → **User Management** tab
4. Scroll down to see the **Ban Sync Plugin** section

You should see:
- Sync status information
- A table with all bans (local + synced)
- Buttons for "Sync Now", "Export Local Bans", and "Settings"
- A form to add new local bans

## What Gets Created Automatically

When you first run the plugin, it creates:

```
fm-dx-webserver/
└── plugins_configs/
    ├── BanSyncPlugin.json        # Plugin settings
    └── BanSyncPlugin-bans.json   # Your local bans
```

**You don't need to create these manually.** The plugin will create them with default settings on first run.

## Default Configuration

The plugin starts with these defaults:

- ✅ Auto-sync: **Enabled** (every 1 hour)
- ✅ Auto-ban types:
  - `auto_banned` - **Enabled**
  - `bot_activity` - **Enabled**
  - `hogging_tef_server` - **Enabled**
  - `controversial_reasoning` - **Disabled**
  - `drama_related` - **Disabled**
  - `other_unspecified_reasons` - **Disabled**

You can change these settings via the UI or by editing `plugins_configs/BanSyncPlugin.json`.

## First-Time Setup

After installation, we recommend:

1. **Click "Sync Now"** to download the latest ban database
2. **Click "Settings"** to review auto-ban settings
3. **Adjust settings** based on your server's needs:
   - Enable/disable specific ban categories
   - Adjust sync interval if desired
4. **Click "Save Settings"** to apply changes

## Testing the Plugin

To verify the plugin is working:

### Test 1: Check Sync Status

1. Go to Setup → User Management → Ban Sync Plugin
2. Look at the status message (should show synced bans count)
3. Click "Sync Now"
4. Verify the status updates

### Test 2: Add a Local Ban

1. Scroll to "Add Local Ban" form
2. Enter a test IP address (e.g., `192.0.2.1`)
3. Enter a ban reason (e.g., "Test ban")
4. Click "Add Ban"
5. Verify the ban appears in the table with source "local"

### Test 3: Remove a Local Ban

1. Find the test ban you just added
2. Click the "Remove" button
3. Confirm the removal
4. Verify the ban is removed from the table

### Test 4: Export Bans

1. Add a test ban (if you removed it)
2. Check the checkbox next to it
3. Click "Export Local Bans"
4. Verify the export modal appears with JSON data and instructions

## Troubleshooting

### ❌ Plugin not loading

**Check:**
1. Is `"BanSyncPlugin/BanSyncPlugin_server.js"` in `config.json` → `plugins` array?
2. Did you restart the server after editing `config.json`?
3. Are all plugin files in the correct locations?

**Console shows:** `Cannot find module` error
- Verify file paths are correct
- Ensure `BanSyncPlugin_server.js` is in `plugins/BanSyncPlugin/` folder

### ❌ UI not appearing

**Check:**
1. Hard refresh the setup page (Ctrl+Shift+R)
2. Check browser console for JavaScript errors (F12 → Console tab)
3. Verify you're logged in as admin
4. Ensure `frontend.js` exists in `plugins/BanSyncPlugin/` folder

### ❌ Sync failing

**Check:**
1. Internet connection is working
2. GitHub is accessible from your server
3. Firewall isn't blocking HTTPS requests

**Console shows:** `Error downloading ban database`
- Check internet connectivity
- Verify the GitHub URL is reachable
- Try accessing https://raw.githubusercontent.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/refs/heads/database/ban-sync-db/db.json in a browser

### ❌ Bans not enforced

**Check:**
1. Are auto-ban settings configured correctly?
2. For synced bans: Is the ban category enabled in Settings?
3. For local bans: Is the IP/username spelled correctly?
4. Check console for "[BanSyncPlugin] Kicking banned user" messages

### ❌ Can't save settings

**Check:**
1. File permissions on `plugins_configs/` folder
2. Server process has write access to the directory
3. Console for permission errors

**Fix:**
```bash
# Linux/Mac - give write permissions
chmod -R 755 plugins_configs/

# Windows - ensure the user running Node.js has write access to the folder
```

## Need More Help?

- **Full Documentation**: See [README.md](README.md) in the same folder
- **GitHub Issues**: https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/issues
- **Ban Appeals**: https://shortcircuit404.com/tef-plugins/fm-dx-webserver-ban-sync/ban-appeal-form

## Next Steps

After installation:

1. ✅ **Sync the database** - Click "Sync Now" to get the latest bans
2. ✅ **Configure settings** - Review and adjust auto-ban categories
3. ✅ **Add local bans** - Ban any problematic users on your server
4. ✅ **Export to GitHub** - Contribute your local bans to help the community

## Uninstalling

To remove the plugin:

1. Remove `"BanSyncPlugin/BanSyncPlugin_server.js"` from `config.json` → `plugins` array
2. Restart the server
3. (Optional) Delete the plugin files:
   - `plugins/BanSyncPlugin.js`
   - `plugins/BanSyncPlugin/` folder
   - `plugins_configs/BanSyncPlugin.json`
   - `plugins_configs/BanSyncPlugin-bans.json`

**Note:** Removing the plugin will stop enforcing synced bans, but your local bans will remain in the standard FM-DX Webserver banlist.

---

**Installation complete! 🎉**

You now have advanced ban management with GitHub database synchronization.
