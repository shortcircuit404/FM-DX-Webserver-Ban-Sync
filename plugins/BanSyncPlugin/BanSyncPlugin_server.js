/**
 * FM-DX Webserver Ban Sync Plugin - Server Component
 *
 * Provides synchronized ban management across TEF receivers
 * Integrates with GitHub-based ban database
 *
 * @author shortcircuit404
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Import server components
const endpointsRouter = require('../../server/endpoints');
const helpers = require('../../server/helpers');
const storage = require('../../server/storage');

// Configuration paths
const rootDir = path.dirname(require.main.filename);
const configFolderPath = path.join(rootDir, 'plugins_configs');
const configFilePath = path.join(configFolderPath, 'BanSyncPlugin.json');
const localBansPath = path.join(configFolderPath, 'BanSyncPlugin-bans.json');

// GitHub database URL
const BAN_DATABASE_URL = 'https://raw.githubusercontent.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/refs/heads/database/ban-sync-db/db.json';

// Ban appeal form URL
const BAN_APPEAL_URL = 'https://shortcircuit404.com/tef-plugins/fm-dx-webserver-ban-sync/ban-appeal-form';

// GitHub repository URL
const GITHUB_REPO_URL = 'https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync';

// Plugin state
let pluginConfig = {
    enabled: true,
    syncInterval: 3600000, // 1 hour in milliseconds
    autoSync: true,
    autoBanSettings: {
        auto_banned: true,
        bot_activity: true,
        hogging_tef_server: true,
        controversial_reasoning: false,
        drama_related: false,
        other_unspecified_reasons: false
    },
    lastSync: null
};

let localBans = {
    banned_users: []
};

let syncedBans = {
    banned_users: []
};

let syncInterval = null;

/**
 * Initialize plugin configuration folder and files
 */
function initializeConfig() {
    // Create config folder if it doesn't exist
    if (!fs.existsSync(configFolderPath)) {
        fs.mkdirSync(configFolderPath, { recursive: true });
        console.log('[BanSyncPlugin] Created config folder');
    }

    // Create default plugin config if it doesn't exist
    if (!fs.existsSync(configFilePath)) {
        fs.writeFileSync(configFilePath, JSON.stringify(pluginConfig, null, 2));
        console.log('[BanSyncPlugin] Created default plugin configuration');
    } else {
        // Load existing config
        try {
            const data = fs.readFileSync(configFilePath, 'utf8');
            pluginConfig = JSON.parse(data);
            console.log('[BanSyncPlugin] Loaded plugin configuration');
        } catch (error) {
            console.error('[BanSyncPlugin] Error loading config:', error);
        }
    }

    // Create default local bans file if it doesn't exist
    if (!fs.existsSync(localBansPath)) {
        fs.writeFileSync(localBansPath, JSON.stringify(localBans, null, 2));
        console.log('[BanSyncPlugin] Created default local bans file');
    } else {
        // Load existing local bans
        try {
            const data = fs.readFileSync(localBansPath, 'utf8');
            localBans = JSON.parse(data);
            console.log('[BanSyncPlugin] Loaded local bans');
        } catch (error) {
            console.error('[BanSyncPlugin] Error loading local bans:', error);
        }
    }

    // Watch for config file changes
    fs.watch(configFilePath, (eventType) => {
        if (eventType === 'change') {
            loadPluginConfig();
        }
    });

    // Watch for local bans file changes
    fs.watch(localBansPath, (eventType) => {
        if (eventType === 'change') {
            loadLocalBans();
        }
    });
}

/**
 * Load plugin configuration from file
 */
function loadPluginConfig() {
    try {
        const data = fs.readFileSync(configFilePath, 'utf8');
        const newConfig = JSON.parse(data);
        pluginConfig = newConfig;
        console.log('[BanSyncPlugin] Reloaded plugin configuration');

        // Restart sync interval if settings changed
        if (pluginConfig.autoSync) {
            restartSyncInterval();
        } else {
            clearSyncInterval();
        }
    } catch (error) {
        console.error('[BanSyncPlugin] Error reloading config:', error);
    }
}

/**
 * Load local bans from file
 */
function loadLocalBans() {
    try {
        const data = fs.readFileSync(localBansPath, 'utf8');
        localBans = JSON.parse(data);
        console.log('[BanSyncPlugin] Reloaded local bans');
    } catch (error) {
        console.error('[BanSyncPlugin] Error reloading local bans:', error);
    }
}

/**
 * Save local bans to file
 */
function saveLocalBans() {
    try {
        fs.writeFileSync(localBansPath, JSON.stringify(localBans, null, 2));
        console.log('[BanSyncPlugin] Saved local bans');
    } catch (error) {
        console.error('[BanSyncPlugin] Error saving local bans:', error);
    }
}

/**
 * Save plugin configuration to file
 */
function savePluginConfig() {
    try {
        fs.writeFileSync(configFilePath, JSON.stringify(pluginConfig, null, 2));
        console.log('[BanSyncPlugin] Saved plugin configuration');
    } catch (error) {
        console.error('[BanSyncPlugin] Error saving config:', error);
    }
}

/**
 * Download ban database from GitHub
 */
function downloadBanDatabase() {
    return new Promise((resolve, reject) => {
        console.log('[BanSyncPlugin] Downloading ban database from GitHub...');

        https.get(BAN_DATABASE_URL, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    // Try to fix common JSON issues
                    let fixedData = data;

                    // Fix missing commas before "ban_date" if preceded by a closing brace/bracket/false/true/null
                    fixedData = fixedData.replace(/(\]|\}|false|true|null)\s*\n\s*"ban_date"/g, '$1,\n      "ban_date"');

                    const banData = JSON.parse(fixedData);
                    syncedBans = banData;
                    pluginConfig.lastSync = new Date().toISOString();
                    savePluginConfig();
                    console.log('[BanSyncPlugin] Successfully downloaded ban database');
                    console.log(`[BanSyncPlugin] Loaded ${syncedBans.banned_users.length} synced ban entries`);
                    resolve(syncedBans);
                } catch (error) {
                    console.error('[BanSyncPlugin] Error parsing ban database:', error);
                    console.error('[BanSyncPlugin] Using empty ban list until database is fixed');
                    syncedBans = { banned_users: [] };
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.error('[BanSyncPlugin] Error downloading ban database:', error);
            reject(error);
        });
    });
}

/**
 * Check if an IP address matches any banned user
 * @param {string} ip - IP address to check
 * @returns {object|null} - Ban entry if found, null otherwise
 */
function checkIpBanned(ip) {
    // Check synced bans first
    for (const bannedUser of syncedBans.banned_users) {
        if (shouldAutoBan(bannedUser)) {
            if (bannedUser.ipv4_addresses.includes(ip) || bannedUser.ipv6_addresses.includes(ip)) {
                return {
                    ...bannedUser,
                    source: 'synced'
                };
            }
        }
    }

    // Check local bans
    for (const bannedUser of localBans.banned_users) {
        if (bannedUser.ipv4_addresses.includes(ip) || bannedUser.ipv6_addresses.includes(ip)) {
            return {
                ...bannedUser,
                source: 'local'
            };
        }
    }

    return null;
}

/**
 * Check if a user agent matches any banned user
 * @param {string} userAgent - User agent to check
 * @returns {object|null} - Ban entry if found, null otherwise
 */
function checkUserAgentBanned(userAgent) {
    if (!userAgent) return null;

    // Check synced bans
    for (const bannedUser of syncedBans.banned_users) {
        if (shouldAutoBan(bannedUser)) {
            if (bannedUser.browser_useragents.includes(userAgent)) {
                return {
                    ...bannedUser,
                    source: 'synced'
                };
            }
        }
    }

    // Check local bans
    for (const bannedUser of localBans.banned_users) {
        if (bannedUser.browser_useragents.includes(userAgent)) {
            return {
                ...bannedUser,
                source: 'local'
            };
        }
    }

    return null;
}

/**
 * Check if a username matches any banned user
 * @param {string} username - Username to check
 * @returns {object|null} - Ban entry if found, null otherwise
 */
function checkUsernameBanned(username) {
    if (!username) return null;

    // Check synced bans
    for (const bannedUser of syncedBans.banned_users) {
        if (shouldAutoBan(bannedUser)) {
            if (bannedUser.usernames.includes(username)) {
                return {
                    ...bannedUser,
                    source: 'synced'
                };
            }
        }
    }

    // Check local bans
    for (const bannedUser of localBans.banned_users) {
        if (bannedUser.usernames.includes(username)) {
            return {
                ...bannedUser,
                source: 'local'
            };
        }
    }

    return null;
}

/**
 * Check if a ban entry should trigger automatic ban based on settings
 * @param {object} bannedUser - Ban entry to check
 * @returns {boolean} - Whether to auto-ban
 */
function shouldAutoBan(bannedUser) {
    const settings = pluginConfig.autoBanSettings;

    if (bannedUser.auto_banned && settings.auto_banned) return true;
    if (bannedUser.bot_activity && settings.bot_activity) return true;
    if (bannedUser.hogging_tef_server && settings.hogging_tef_server) return true;
    if (bannedUser.controversial_reasoning && settings.controversial_reasoning) return true;
    if (bannedUser.drama_related && settings.drama_related) return true;
    if (bannedUser.other_unspecified_reasons && settings.other_unspecified_reasons) return true;

    return false;
}

/**
 * Kick a banned user from the server
 * @param {object} ws - WebSocket connection
 * @param {object} banEntry - Ban entry information
 */
function kickBannedUser(ws, banEntry) {
    const banMessage = {
        banned: true,
        reason: banEntry.ban_reason,
        evidence: banEntry.evidence_links,
        appeal_url: BAN_APPEAL_URL,
        repo_url: GITHUB_REPO_URL,
        ban_date: banEntry.ban_date,
        source: banEntry.source
    };

    // Send ban notification to client
    try {
        ws.send(JSON.stringify({
            type: 'BAN_NOTIFICATION',
            data: banMessage
        }));
    } catch (error) {
        console.error('[BanSyncPlugin] Error sending ban notification:', error);
    }

    // Close connection after short delay
    setTimeout(() => {
        try {
            ws.close(1008, 'Banned from server');
        } catch (error) {
            console.error('[BanSyncPlugin] Error closing connection:', error);
        }
    }, 500);
}

/**
 * Monitor connected users and kick banned ones
 */
function monitorConnectedUsers() {
    if (!storage.connectedUsers) return;

    for (const user of storage.connectedUsers) {
        if (!user.ip) continue;

        const banEntry = checkIpBanned(user.ip);
        if (banEntry) {
            console.log(`[BanSyncPlugin] Kicking banned user: ${user.ip} (${banEntry.source})`);
            if (user.instance && user.instance.readyState === 1) { // WebSocket.OPEN
                kickBannedUser(user.instance, banEntry);
            }
        }
    }
}

/**
 * Restart sync interval
 */
function restartSyncInterval() {
    clearSyncInterval();

    if (pluginConfig.autoSync && pluginConfig.syncInterval > 0) {
        syncInterval = setInterval(() => {
            downloadBanDatabase().then(() => {
                console.log('[BanSyncPlugin] Auto-sync completed');
                monitorConnectedUsers();
            }).catch((error) => {
                console.error('[BanSyncPlugin] Auto-sync failed:', error);
            });
        }, pluginConfig.syncInterval);

        console.log(`[BanSyncPlugin] Auto-sync enabled (interval: ${pluginConfig.syncInterval}ms)`);
    }
}

/**
 * Clear sync interval
 */
function clearSyncInterval() {
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
        console.log('[BanSyncPlugin] Auto-sync disabled');
    }
}

/**
 * Get all bans (local and synced) for display
 */
function getAllBans() {
    const allBans = [];

    // Add synced bans that match auto-ban criteria
    for (const bannedUser of syncedBans.banned_users) {
        if (shouldAutoBan(bannedUser)) {
            allBans.push({
                ...bannedUser,
                source: 'synced'
            });
        }
    }

    // Add local bans
    for (const bannedUser of localBans.banned_users) {
        allBans.push({
            ...bannedUser,
            source: 'local'
        });
    }

    return allBans;
}

/**
 * Add a local ban entry
 */
function addLocalBan(banEntry) {
    // Generate new ID
    const maxId = localBans.banned_users.reduce((max, user) =>
        user.id > max ? user.id : max, -1);

    banEntry.id = maxId + 1;
    banEntry.ban_date = banEntry.ban_date || new Date().toISOString();
    banEntry.updated_date = new Date().toISOString();

    // Ensure all required fields exist
    const completeBanEntry = {
        id: banEntry.id,
        ipv4_addresses: banEntry.ipv4_addresses || [],
        ipv6_addresses: banEntry.ipv6_addresses || [],
        browser_useragents: banEntry.browser_useragents || [],
        usernames: banEntry.usernames || [],
        ban_reason: banEntry.ban_reason || '',
        evidence_links: banEntry.evidence_links || [],
        auto_banned: banEntry.auto_banned || false,
        bot_activity: banEntry.bot_activity || false,
        hogging_tef_server: banEntry.hogging_tef_server || false,
        controversial_reasoning: banEntry.controversial_reasoning || false,
        drama_related: banEntry.drama_related || false,
        other_unspecified_reasons: banEntry.other_unspecified_reasons || false,
        ban_date: banEntry.ban_date,
        updated_date: banEntry.updated_date
    };

    localBans.banned_users.push(completeBanEntry);
    saveLocalBans();

    return completeBanEntry;
}

/**
 * Remove a local ban entry by ID
 */
function removeLocalBan(id) {
    const index = localBans.banned_users.findIndex(user => user.id === id);
    if (index !== -1) {
        localBans.banned_users.splice(index, 1);
        saveLocalBans();
        return true;
    }
    return false;
}

/**
 * Update a local ban entry
 */
function updateLocalBan(id, updates) {
    const index = localBans.banned_users.findIndex(user => user.id === id);
    if (index !== -1) {
        localBans.banned_users[index] = {
            ...localBans.banned_users[index],
            ...updates,
            updated_date: new Date().toISOString()
        };
        saveLocalBans();
        return localBans.banned_users[index];
    }
    return null;
}

/**
 * Export local bans in GitHub-compatible format
 */
function exportLocalBansForGitHub(selectedIds) {
    const bansToExport = selectedIds
        ? localBans.banned_users.filter(user => selectedIds.includes(user.id))
        : localBans.banned_users;

    return bansToExport;
}

// ============================================================================
// HTTP ENDPOINTS
// ============================================================================

/**
 * Get ban sync status and configuration
 */
endpointsRouter.get('/bansync/status', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({
        success: true,
        config: pluginConfig,
        stats: {
            syncedBans: syncedBans.banned_users.length,
            localBans: localBans.banned_users.length,
            activeSyncedBans: syncedBans.banned_users.filter(shouldAutoBan).length
        }
    });
});

/**
 * Trigger manual sync
 */
endpointsRouter.get('/bansync/sync', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    downloadBanDatabase()
        .then(() => {
            monitorConnectedUsers();
            res.json({
                success: true,
                message: 'Ban database synced successfully',
                stats: {
                    syncedBans: syncedBans.banned_users.length,
                    activeSyncedBans: syncedBans.banned_users.filter(shouldAutoBan).length
                }
            });
        })
        .catch((error) => {
            res.status(500).json({
                success: false,
                message: 'Failed to sync ban database',
                error: error.message
            });
        });
});

/**
 * Get all bans (local and synced)
 */
endpointsRouter.get('/bansync/bans', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const allBans = getAllBans();
    res.json({ success: true, bans: allBans });
});

/**
 * Get local bans only
 */
endpointsRouter.get('/bansync/bans/local', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, bans: localBans.banned_users });
});

/**
 * Add a local ban
 */
endpointsRouter.post('/bansync/bans/add', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const banEntry = req.body;
    const newBan = addLocalBan(banEntry);

    // Kick banned users immediately
    monitorConnectedUsers();

    res.json({ success: true, ban: newBan });
});

/**
 * Remove a local ban
 */
endpointsRouter.delete('/bansync/bans/remove/:id', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const id = parseInt(req.params.id);
    const success = removeLocalBan(id);

    if (success) {
        res.json({ success: true, message: 'Ban removed successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Ban not found' });
    }
});

/**
 * Update a local ban
 */
endpointsRouter.put('/bansync/bans/update/:id', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const id = parseInt(req.params.id);
    const updates = req.body;
    const updatedBan = updateLocalBan(id, updates);

    if (updatedBan) {
        res.json({ success: true, ban: updatedBan });
    } else {
        res.status(404).json({ success: false, message: 'Ban not found' });
    }
});

/**
 * Export local bans for GitHub contribution
 */
endpointsRouter.post('/bansync/export', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const selectedIds = req.body.selectedIds;
    const exportedBans = exportLocalBansForGitHub(selectedIds);

    const instructions = `
# How to Contribute Your Bans to the Database

1. Fork the repository at: ${GITHUB_REPO_URL}
2. Checkout the 'database' branch
3. Edit the file: ban-sync-db/db.json
4. Add the following entries to the "banned_users" array:

${JSON.stringify(exportedBans, null, 2)}

5. Ensure each entry has a unique ID (increment from the last ID in the file)
6. Update the "updated_date" field to the current timestamp
7. Commit your changes with a descriptive message
8. Submit a Pull Request to the 'database' branch
9. Wait for review and approval

For more information, see: ${GITHUB_REPO_URL}/blob/main/README.md
`;

    res.json({
        success: true,
        bans: exportedBans,
        instructions: instructions
    });
});

/**
 * Update plugin configuration
 */
endpointsRouter.post('/bansync/config', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const newConfig = req.body;
    pluginConfig = { ...pluginConfig, ...newConfig };
    savePluginConfig();

    // Restart sync if settings changed
    if (pluginConfig.autoSync) {
        restartSyncInterval();
    } else {
        clearSyncInterval();
    }

    res.json({ success: true, config: pluginConfig });
});

/**
 * Check if an IP is banned
 */
endpointsRouter.get('/bansync/check', (req, res) => {
    if (!req.session.isAdminAuthenticated) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const ip = req.query.ip;
    const banEntry = checkIpBanned(ip);

    if (banEntry) {
        res.json({
            success: true,
            banned: true,
            banEntry: banEntry
        });
    } else {
        res.json({
            success: true,
            banned: false
        });
    }
});

// ============================================================================
// INITIALIZATION
// ============================================================================

console.log('[BanSyncPlugin] Initializing Ban Sync Plugin...');

// Initialize configuration
initializeConfig();

// Download ban database on startup
downloadBanDatabase()
    .then(() => {
        console.log('[BanSyncPlugin] Initial ban database sync completed');
        monitorConnectedUsers();
    })
    .catch((error) => {
        console.error('[BanSyncPlugin] Failed to download ban database on startup:', error);
    });

// Start auto-sync if enabled
if (pluginConfig.autoSync) {
    restartSyncInterval();
}

// Monitor connected users every 30 seconds
setInterval(monitorConnectedUsers, 30000);

console.log('[BanSyncPlugin] Ban Sync Plugin initialized successfully');

module.exports = {
    checkIpBanned,
    checkUserAgentBanned,
    checkUsernameBanned,
    kickBannedUser,
    getAllBans,
    addLocalBan,
    removeLocalBan,
    updateLocalBan
};
