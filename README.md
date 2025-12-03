# FM-DX Webserver Ban Sync — Ban Database README

## Overview

This repository contains a synchronized JSON-based ban-list database used across TEF receivers and related FM-DX Webserver services. The system allows multiple servers to share ban data consistently and safely.

This document explains:

- The structure of the ban database  
- How to contribute correctly  
- Where to submit ban appeals  
- Direct links to the correct branch and database file  

---

## Repository Links

- **Database Branch:**  
  https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/tree/database

- **Ban Database File:**  
  https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/blob/database/ban-sync-db/db.json

---

## JSON Structure

All banned user data resides in:

```
ban-sync-db/db.json
```

Each user is represented as an object inside the `banned_users` array.

### Example Structure

```json
{
  "banned_users": [
    {
      "id": 0,
      "ipv4_addresses": ["127.0.0.1"],
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
  ]
}
```

### Field Descriptions

| Field | Purpose |
|-------|---------|
| **id** | Unique numeric ID for each entry. Must increment sequentially. |
| **ipv4_addresses** | List of known IPv4 addresses for the user. |
| **ipv6_addresses** | List of known IPv6 addresses. |
| **browser_useragents** | Browser user-agent strings associated with the user. |
| **usernames** | Any associated usernames. |
| **ban_reason** | Complete explanation of why the user was banned. |
| **evidence_links** | URLs or references that support the ban. |
| **auto_banned** | Indicates if the ban was automatically triggered. |
| **bot_activity** | True if the user exhibited automated/bot-like behavior. |
| **hogging_tef_server** | True if the user monopolized TEF resources. |
| **controversial_reasoning** | True for bans based on unusual or edge-case behavior. |
| **drama_related** | True if the ban resulted from conflict or harassment. |
| **other_unspecified_reasons** | A catch-all for miscellaneous ban reasons. |

---

## Contributing to the Ban List

All ban-list contributions must follow strict guidelines to avoid corrupting the shared database.

### 1. Use the Correct Branch

- **Do NOT submit ban entries to `main`.**  
  `main` is reserved for plugin source code.

- **All database updates must target the `database` branch.**

Link:  
https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/tree/database

### 2. Edit the Correct File

All ban additions or modifications must be made in:

```
ban-sync-db/db.json
```

Direct link:  
https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/blob/database/ban-sync-db/db.json

### 3. Do Not Overwrite Existing Entries

- Do *not* modify existing users unless you have **verified new information**.
- Do *not* delete entries.
- Always append new users by adding the next available numeric ID.

### 4. Provide Accurate Reasoning and Evidence

Each contributed ban must include:

- A clear, detailed **ban_reason**
- Any **evidence_links** supporting the ban
- IPs / usernames / user-agents if known

Incomplete entries may be rejected.

### 5. Submit a Ban Appeal if Needed

If you believe you were banned incorrectly:

**Ban Appeal Form:**  
*Replace this text with the actual form link.*

---

## Pull Request Workflow

1. Fork the repository  
2. Switch to the **database** branch  
3. Edit `ban-sync-db/db.json`  
4. Validate JSON formatting  
5. Commit changes  
6. Open a pull request targeting the **database** branch  
7. Await review  
