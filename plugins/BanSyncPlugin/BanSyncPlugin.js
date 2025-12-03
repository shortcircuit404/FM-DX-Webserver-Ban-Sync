/**
 * FM-DX Webserver Ban Sync Plugin - Frontend Component
 *
 * Provides UI integration for ban management in the setup page
 *
 * @author shortcircuit404
 * @version 1.0.0
 */

(function() {
    'use strict';

    console.log('[BanSyncPlugin] Frontend loaded');

    // GitHub repository URLs
    const GITHUB_REPO_URL = 'https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync';
    const BAN_APPEAL_URL = 'https://shortcircuit404.com/tef-plugins/fm-dx-webserver-ban-sync/ban-appeal-form';

    // Plugin state
    let allBans = [];
    let pluginConfig = {};
    let selectedBanIds = new Set();

    /**
     * Initialize the plugin when the setup page loads
     */
    function init() {
        // Only run on setup page
        if (!window.location.pathname.includes('setup')) {
            return;
        }

        console.log('[BanSyncPlugin] Initializing frontend UI');

        // Wait for the page to fully load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', injectUI);
        } else {
            injectUI();
        }
    }

    /**
     * Inject custom UI into the setup page
     */
    function injectUI() {
        // Find the User Management tab (banlist section)
        const banlistSection = document.querySelector('#users .panel-100.p-bottom-20');

        if (!banlistSection) {
            console.warn('[BanSyncPlugin] Could not find banlist section');
            return;
        }

        // Create plugin UI container
        const pluginContainer = document.createElement('div');
        pluginContainer.className = 'panel-100 p-bottom-20';
        pluginContainer.innerHTML = `
            <h3>Ban Sync Plugin</h3>
            <p>Advanced ban management with synchronized ban database from GitHub.<br>
            <span class="text-gray">Syncs with: <a href="${GITHUB_REPO_URL}" target="_blank">FM-DX-Webserver-Ban-Sync</a></span></p>

            <div style="margin-bottom: 20px;">
                <button id="bansync-sync-now" class="button-primary">Sync Now</button>
                <button id="bansync-export" class="button-secondary">Export Local Bans</button>
                <button id="bansync-settings" class="button-secondary">Settings</button>
                <span id="bansync-status" style="margin-left: 15px; color: #888;"></span>
            </div>

            <div id="bansync-settings-panel" style="display: none; margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                <h4>Auto-Ban Settings</h4>
                <p class="text-gray">Select which ban reasons should automatically sync to your server:</p>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
                    <label><input type="checkbox" id="setting-auto_banned"> Auto-banned</label>
                    <label><input type="checkbox" id="setting-bot_activity"> Bot Activity</label>
                    <label><input type="checkbox" id="setting-hogging_tef_server"> Hogging TEF Server</label>
                    <label><input type="checkbox" id="setting-controversial_reasoning"> Controversial Reasoning</label>
                    <label><input type="checkbox" id="setting-drama_related"> Drama Related</label>
                    <label><input type="checkbox" id="setting-other_unspecified_reasons"> Other Unspecified</label>
                </div>
                <div style="margin-top: 15px;">
                    <label>
                        <input type="checkbox" id="setting-auto_sync"> Enable Auto-Sync
                    </label>
                    <label style="margin-left: 20px;">
                        Sync Interval (hours): <input type="number" id="setting-sync_interval" min="1" max="24" value="1" style="width: 60px;">
                    </label>
                </div>
                <button id="bansync-save-settings" class="button-primary" style="margin-top: 10px;">Save Settings</button>
            </div>

            <div id="bansync-enhanced-table-container">
                <table class="table-big" id="bansync-enhanced-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" id="bansync-select-all"></th>
                            <th>Source</th>
                            <th>IP Addresses</th>
                            <th>Usernames</th>
                            <th>Ban Date</th>
                            <th>Updated</th>
                            <th>Reason</th>
                            <th>Evidence</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="bansync-enhanced-tbody">
                        <tr>
                            <td colspan="9" style="text-align: center;">Loading bans...</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="bansync-add-form" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                <h4>Add Local Ban</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
                    <div>
                        <label>IPv4 Addresses (comma-separated):</label>
                        <input type="text" id="bansync-ipv4" class="w-100" placeholder="192.168.1.1, 10.0.0.1">
                    </div>
                    <div>
                        <label>IPv6 Addresses (comma-separated):</label>
                        <input type="text" id="bansync-ipv6" class="w-100" placeholder="2001:db8::1">
                    </div>
                    <div>
                        <label>Usernames (comma-separated):</label>
                        <input type="text" id="bansync-usernames" class="w-100" placeholder="user1, user2">
                    </div>
                    <div>
                        <label>User Agents (comma-separated):</label>
                        <input type="text" id="bansync-useragents" class="w-100" placeholder="Mozilla/5.0...">
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label>Ban Reason:</label>
                        <input type="text" id="bansync-reason" class="w-100" placeholder="Describe the reason for the ban">
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label>Evidence Links (comma-separated URLs):</label>
                        <input type="text" id="bansync-evidence" class="w-100" placeholder="https://example.com/screenshot.png">
                    </div>
                    <div style="grid-column: 1 / -1;">
                        <label style="margin-right: 15px;">Ban Type:</label>
                        <label><input type="checkbox" id="bansync-auto_banned"> Auto-banned</label>
                        <label style="margin-left: 10px;"><input type="checkbox" id="bansync-bot_activity"> Bot Activity</label>
                        <label style="margin-left: 10px;"><input type="checkbox" id="bansync-hogging"> Hogging TEF Server</label>
                        <label style="margin-left: 10px;"><input type="checkbox" id="bansync-controversial"> Controversial</label>
                        <label style="margin-left: 10px;"><input type="checkbox" id="bansync-drama"> Drama Related</label>
                        <label style="margin-left: 10px;"><input type="checkbox" id="bansync-other"> Other</label>
                    </div>
                </div>
                <button id="bansync-add-ban" class="button-primary" style="margin-top: 10px;">Add Ban</button>
            </div>

            <div id="bansync-export-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; overflow-y: auto;">
                <div style="margin: 50px auto; max-width: 800px; background: #1a1a1a; padding: 30px; border-radius: 10px; position: relative;">
                    <button id="bansync-close-modal" style="position: absolute; top: 10px; right: 10px; background: transparent; border: none; color: #fff; font-size: 24px; cursor: pointer;">&times;</button>
                    <h3>Export Local Bans for GitHub</h3>
                    <div id="bansync-export-content"></div>
                </div>
            </div>
        `;

        // Insert plugin container after the banlist section
        banlistSection.parentNode.insertBefore(pluginContainer, banlistSection.nextSibling);

        // Attach event listeners
        attachEventListeners();

        // Load initial data
        loadPluginData();
    }

    /**
     * Attach event listeners to UI elements
     */
    function attachEventListeners() {
        // Sync now button
        document.getElementById('bansync-sync-now')?.addEventListener('click', syncNow);

        // Export button
        document.getElementById('bansync-export')?.addEventListener('click', showExportModal);

        // Settings button
        document.getElementById('bansync-settings')?.addEventListener('click', toggleSettings);

        // Save settings button
        document.getElementById('bansync-save-settings')?.addEventListener('click', saveSettings);

        // Add ban button
        document.getElementById('bansync-add-ban')?.addEventListener('click', addBan);

        // Select all checkbox
        document.getElementById('bansync-select-all')?.addEventListener('change', toggleSelectAll);

        // Close modal
        document.getElementById('bansync-close-modal')?.addEventListener('click', closeExportModal);
    }

    /**
     * Load plugin data from server
     */
    async function loadPluginData() {
        try {
            // Load configuration
            const configResponse = await fetch('/bansync/status');
            const configData = await configResponse.json();

            if (configData.success) {
                pluginConfig = configData.config;
                updateStatusDisplay(configData.stats);
                updateSettingsUI();
            }

            // Load all bans
            const bansResponse = await fetch('/bansync/bans');
            const bansData = await bansResponse.json();

            if (bansData.success) {
                allBans = bansData.bans;
                renderBansTable();
            }
        } catch (error) {
            console.error('[BanSyncPlugin] Error loading plugin data:', error);
            updateStatusDisplay({ error: 'Failed to load data' });
        }
    }

    /**
     * Update status display
     */
    function updateStatusDisplay(stats) {
        const statusEl = document.getElementById('bansync-status');
        if (!statusEl) return;

        if (stats.error) {
            statusEl.textContent = `Error: ${stats.error}`;
            statusEl.style.color = '#ff4444';
        } else {
            const lastSync = pluginConfig.lastSync
                ? new Date(pluginConfig.lastSync).toLocaleString()
                : 'Never';
            statusEl.textContent = `Synced: ${stats.activeSyncedBans}/${stats.syncedBans} | Local: ${stats.localBans} | Last sync: ${lastSync}`;
            statusEl.style.color = '#888';
        }
    }

    /**
     * Update settings UI with current config
     */
    function updateSettingsUI() {
        const settings = pluginConfig.autoBanSettings || {};

        document.getElementById('setting-auto_banned').checked = settings.auto_banned || false;
        document.getElementById('setting-bot_activity').checked = settings.bot_activity || false;
        document.getElementById('setting-hogging_tef_server').checked = settings.hogging_tef_server || false;
        document.getElementById('setting-controversial_reasoning').checked = settings.controversial_reasoning || false;
        document.getElementById('setting-drama_related').checked = settings.drama_related || false;
        document.getElementById('setting-other_unspecified_reasons').checked = settings.other_unspecified_reasons || false;

        document.getElementById('setting-auto_sync').checked = pluginConfig.autoSync || false;
        document.getElementById('setting-sync_interval').value = (pluginConfig.syncInterval || 3600000) / 3600000;
    }

    /**
     * Render bans table
     */
    function renderBansTable() {
        const tbody = document.getElementById('bansync-enhanced-tbody');
        if (!tbody) return;

        if (allBans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No bans found.</td></tr>';
            return;
        }

        tbody.innerHTML = allBans.map(ban => `
            <tr data-ban-id="${ban.id}" data-ban-source="${ban.source}">
                <td>
                    ${ban.source === 'local' ? `<input type="checkbox" class="ban-select" data-ban-id="${ban.id}">` : ''}
                </td>
                <td>
                    <span class="badge" style="background: ${ban.source === 'local' ? '#4CAF50' : '#2196F3'};">
                        ${ban.source}
                    </span>
                </td>
                <td>${formatIpAddresses(ban)}</td>
                <td>${ban.usernames.join(', ') || '-'}</td>
                <td>${formatDate(ban.ban_date)}</td>
                <td>${formatDate(ban.updated_date)}</td>
                <td title="${ban.ban_reason}">${truncate(ban.ban_reason, 50)}</td>
                <td>${formatEvidenceLinks(ban.evidence_links)}</td>
                <td>
                    ${ban.source === 'local' ? `<button class="btn-remove" data-ban-id="${ban.id}">Remove</button>` : '-'}
                </td>
            </tr>
        `).join('');

        // Attach remove button listeners
        tbody.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => removeBan(parseInt(e.target.dataset.banId)));
        });

        // Attach checkbox listeners
        tbody.querySelectorAll('.ban-select').forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedBans);
        });
    }

    /**
     * Format IP addresses for display
     */
    function formatIpAddresses(ban) {
        const ips = [...ban.ipv4_addresses, ...ban.ipv6_addresses];
        if (ips.length === 0) return '-';
        if (ips.length === 1) return ips[0];
        return `${ips[0]} <span style="color: #888;">+${ips.length - 1} more</span>`;
    }

    /**
     * Format evidence links
     */
    function formatEvidenceLinks(links) {
        if (!links || links.length === 0) return '-';
        return `<a href="${links[0]}" target="_blank">View (${links.length})</a>`;
    }

    /**
     * Format date
     */
    function formatDate(dateString) {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return dateString;
        }
    }

    /**
     * Truncate text
     */
    function truncate(text, maxLength) {
        if (!text) return '-';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Sync now
     */
    async function syncNow() {
        const statusEl = document.getElementById('bansync-status');
        statusEl.textContent = 'Syncing...';
        statusEl.style.color = '#ffaa00';

        try {
            const response = await fetch('/bansync/sync');
            const data = await response.json();

            if (data.success) {
                statusEl.textContent = 'Sync successful!';
                statusEl.style.color = '#44ff44';
                setTimeout(() => loadPluginData(), 1000);
            } else {
                statusEl.textContent = `Sync failed: ${data.message}`;
                statusEl.style.color = '#ff4444';
            }
        } catch (error) {
            statusEl.textContent = `Sync error: ${error.message}`;
            statusEl.style.color = '#ff4444';
        }
    }

    /**
     * Toggle settings panel
     */
    function toggleSettings() {
        const panel = document.getElementById('bansync-settings-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    /**
     * Save settings
     */
    async function saveSettings() {
        const newConfig = {
            autoSync: document.getElementById('setting-auto_sync').checked,
            syncInterval: parseInt(document.getElementById('setting-sync_interval').value) * 3600000,
            autoBanSettings: {
                auto_banned: document.getElementById('setting-auto_banned').checked,
                bot_activity: document.getElementById('setting-bot_activity').checked,
                hogging_tef_server: document.getElementById('setting-hogging_tef_server').checked,
                controversial_reasoning: document.getElementById('setting-controversial_reasoning').checked,
                drama_related: document.getElementById('setting-drama_related').checked,
                other_unspecified_reasons: document.getElementById('setting-other_unspecified_reasons').checked
            }
        };

        try {
            const response = await fetch('/bansync/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });

            const data = await response.json();

            if (data.success) {
                alert('Settings saved successfully!');
                pluginConfig = data.config;
                loadPluginData();
            } else {
                alert('Failed to save settings: ' + data.message);
            }
        } catch (error) {
            alert('Error saving settings: ' + error.message);
        }
    }

    /**
     * Add ban
     */
    async function addBan() {
        const ipv4 = document.getElementById('bansync-ipv4').value
            .split(',').map(s => s.trim()).filter(s => s);
        const ipv6 = document.getElementById('bansync-ipv6').value
            .split(',').map(s => s.trim()).filter(s => s);
        const usernames = document.getElementById('bansync-usernames').value
            .split(',').map(s => s.trim()).filter(s => s);
        const useragents = document.getElementById('bansync-useragents').value
            .split(',').map(s => s.trim()).filter(s => s);
        const reason = document.getElementById('bansync-reason').value;
        const evidence = document.getElementById('bansync-evidence').value
            .split(',').map(s => s.trim()).filter(s => s);

        const banEntry = {
            ipv4_addresses: ipv4,
            ipv6_addresses: ipv6,
            usernames: usernames,
            browser_useragents: useragents,
            ban_reason: reason,
            evidence_links: evidence,
            auto_banned: document.getElementById('bansync-auto_banned').checked,
            bot_activity: document.getElementById('bansync-bot_activity').checked,
            hogging_tef_server: document.getElementById('bansync-hogging').checked,
            controversial_reasoning: document.getElementById('bansync-controversial').checked,
            drama_related: document.getElementById('bansync-drama').checked,
            other_unspecified_reasons: document.getElementById('bansync-other').checked
        };

        try {
            const response = await fetch('/bansync/bans/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(banEntry)
            });

            const data = await response.json();

            if (data.success) {
                alert('Ban added successfully!');
                // Clear form
                document.getElementById('bansync-ipv4').value = '';
                document.getElementById('bansync-ipv6').value = '';
                document.getElementById('bansync-usernames').value = '';
                document.getElementById('bansync-useragents').value = '';
                document.getElementById('bansync-reason').value = '';
                document.getElementById('bansync-evidence').value = '';
                loadPluginData();
            } else {
                alert('Failed to add ban: ' + data.message);
            }
        } catch (error) {
            alert('Error adding ban: ' + error.message);
        }
    }

    /**
     * Remove ban
     */
    async function removeBan(id) {
        if (!confirm('Are you sure you want to remove this ban?')) {
            return;
        }

        try {
            const response = await fetch(`/bansync/bans/remove/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                alert('Ban removed successfully!');
                loadPluginData();
            } else {
                alert('Failed to remove ban: ' + data.message);
            }
        } catch (error) {
            alert('Error removing ban: ' + error.message);
        }
    }

    /**
     * Toggle select all
     */
    function toggleSelectAll(e) {
        const checked = e.target.checked;
        document.querySelectorAll('.ban-select').forEach(checkbox => {
            checkbox.checked = checked;
        });
        updateSelectedBans();
    }

    /**
     * Update selected bans
     */
    function updateSelectedBans() {
        selectedBanIds.clear();
        document.querySelectorAll('.ban-select:checked').forEach(checkbox => {
            selectedBanIds.add(parseInt(checkbox.dataset.banId));
        });
    }

    /**
     * Show export modal
     */
    async function showExportModal() {
        if (selectedBanIds.size === 0) {
            alert('Please select at least one local ban to export.');
            return;
        }

        try {
            const response = await fetch('/bansync/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ selectedIds: Array.from(selectedBanIds) })
            });

            const data = await response.json();

            if (data.success) {
                const contentEl = document.getElementById('bansync-export-content');
                contentEl.innerHTML = `
                    <pre style="background: #000; padding: 15px; border-radius: 5px; overflow-x: auto; max-height: 400px;">${escapeHtml(JSON.stringify(data.bans, null, 2))}</pre>
                    <button id="bansync-copy-json" class="button-primary" style="margin-top: 10px;">Copy JSON</button>
                    <h4 style="margin-top: 20px;">Instructions:</h4>
                    <pre style="background: #000; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${escapeHtml(data.instructions)}</pre>
                `;

                document.getElementById('bansync-copy-json')?.addEventListener('click', () => {
                    navigator.clipboard.writeText(JSON.stringify(data.bans, null, 2));
                    alert('JSON copied to clipboard!');
                });

                document.getElementById('bansync-export-modal').style.display = 'block';
            } else {
                alert('Failed to export bans: ' + data.message);
            }
        } catch (error) {
            alert('Error exporting bans: ' + error.message);
        }
    }

    /**
     * Close export modal
     */
    function closeExportModal() {
        document.getElementById('bansync-export-modal').style.display = 'none';
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize plugin
    init();

})();
