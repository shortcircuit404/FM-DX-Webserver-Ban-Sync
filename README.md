# FM-DX Webserver Ban Sync — Database Branch README

This branch contains the synchronized ban-list database used by all participating FM-DX Webserver and TEF server deployments.

Only database files should be modified here. **Do not commit source code to this branch.**

---

## Database File Location

All data lives in:

```
ban-sync-db/db.json
```

Direct link:  
https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/blob/database/ban-sync-db/db.json

---

## JSON Schema Overview

Each banned user entry uses the following structure:

```json
{
  "id": 0,
  "ipv4_addresses": [],
  "ipv6_addresses": [],
  "browser_useragents": [],
  "usernames": [],
  "ban_reason": "",
  "evidence_links": [],
  "auto_banned": false,
  "bot_activity": false,
  "hogging_tef_server": false,
  "controversial_reasoning": false,
  "drama_related": false,
  "other_unspecified_reasons": false
}
```

### Field Definitions

- **id** — Sequential numeric identifier.  
- **ipv4_addresses / ipv6_addresses** — Known IPs linked to the user.  
- **browser_useragents** — User-agent strings associated with the user.  
- **usernames** — Any names tied to the user.  
- **ban_reason** — Full explanation of the ban.  
- **evidence_links** — Logs, screenshots, or other supporting items.  
- **auto_banned** — Whether the system banned them automatically.  
- **bot_activity** — Whether the user exhibited automated activity.  
- **hogging_tef_server** — Whether they monopolized TEF frequency access.  
- **controversial_reasoning** — Unusual or edge-case ban reasons.  
- **drama_related** — Conflict/harassment–based bans.  
- **other_unspecified_reasons** — Miscellaneous ban categories.  

---

## Contribution Rules

To maintain the integrity of the shared ban list, contributors must follow these rules:

### ✔ All PRs must target the `database` branch

Do **not** modify the `main` branch unless working on the plugin code itself.

### ✔ Modify only `ban-sync-db/db.json`

Changes to other files in this branch should be avoided unless coordinated with maintainers.

### ✔ Never overwrite existing users

- Do not delete or replace users.
- Only update an existing entry when new verified information is available.
- Always append new entries using the next available `id`.

### ✔ Provide clear reasoning and evidence

Every new ban must include:

- A meaningful **ban_reason**
- Any available **evidence_links**
- Relevant IPs, usernames, and user-agents

### ✔ False Ban? Submit an Appeal

If you believe your ban is inaccurate:

**Ban Appeal Form:**  
*Replace this text with the proper link.*

---

## Pull Request Instructions

1. Fork the repository  
2. Checkout the **database** branch  
3. Edit `ban-sync-db/db.json`  
4. Validate JSON formatting before commit  
5. Commit your changes with a descriptive message  
6. Open a PR against the **database** branch  
