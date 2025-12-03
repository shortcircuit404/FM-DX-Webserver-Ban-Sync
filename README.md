# FM-DX Webserver Ban Sync — Ban Database README

## Overview

This repository contains a synchronized JSON-based ban-list database used across TEF receivers and related FM-DX Webserver services. The system allows multiple servers to share ban data consistently and safely.

This documentation covers:

- The JSON database structure  
- Contribution guidelines  
- Branch requirements  
- Evidence standards  
- Appeal instructions  
- Direct links to the appropriate branch and database file  

---

## Repository Links

- **Database Branch:**  
  https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/tree/database

- **Ban Database File:**  
  https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/blob/database/ban-sync-db/db.json

---

## JSON Structure

All banned user data is stored at:

```
ban-sync-db/db.json
```

Each user is represented as an object under `banned_users`.

### Example Structure

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
  "other_unspecified_reasons": false,
  "ban_date": "",
  "updated_date": ""
}
```

---

## Field Descriptions

| Field | Description |
|-------|-------------|
| **id** | Unique numeric identifier for the banned user entry. Increment sequentially. |
| **ipv4_addresses** | List of IPv4 addresses tied to the user. |
| **ipv6_addresses** | List of IPv6 addresses tied to the user. |
| **browser_useragents** | Associated browser User-Agent strings, if any. |
| **usernames** | Usernames linked to the banned user. |
| **ban_reason** | A complete, descriptive explanation of the ban. |
| **evidence_links** | URLs or references to logs, screenshots, or other evidence. |
| **auto_banned** | Whether the system automatically applied the ban. |
| **bot_activity** | Whether the user showed behavior consistent with automation/bots. |
| **hogging_tef_server** | Whether the user monopolized the TEF server or frequencies. |
| **controversial_reasoning** | Whether the ban reason falls into unusual or edge-case categories. |
| **drama_related** | Whether the ban resulted from conflict, harassment, or interpersonal issues. |
| **other_unspecified_reasons** | For bans that do not fit the listed categories. |
| **ban_date** | The ISO-8601 timestamp (UTC) when the ban was applied. |
| **updated_date** | The ISO-8601 timestamp (UTC) of last modification to the ban entry. |

---

## Contributing to the Ban List

All contributions must adhere to the following rules to preserve database integrity.

### 1. Use the Correct Branch

- **Do NOT commit to the `main` branch unless modifying plugin code.**
- All database updates must target the **`database`** branch.

Database branch link:  
https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/tree/database

### 2. Edit the Correct File

All contributions must modify:

```
ban-sync-db/db.json
```

Direct link:  
https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/blob/database/ban-sync-db/db.json

### 3. Do Not Overwrite Existing Entries

- Do *not* remove or replace existing users unless adding **new, verified data**.
- When updating, ensure **updated_date** is changed to the correct timestamp.
- New users must use the next available **id**.

### 4. Provide Proper Evidence and Reasoning

Every ban entry must include:

- A detailed **ban_reason**
- Any **evidence_links** if available  
- Relevant IPs, usernames, and user-agents  
- A correct **ban_date** timestamp  
- A correct **updated_date** timestamp  

### 5. Ban Appeals

If you believe a ban is incorrect:

**Ban Appeal Form:**  
*Replace this text with the actual form link.*

---

## Pull Request Workflow

1. Fork the repository  
2. Checkout the **database** branch  
3. Edit `ban-sync-db/db.json`  
4. Validate that your JSON is properly formatted  
5. Add reasoning to your commit message  
6. Submit a PR to the **database** branch  
7. Wait for review  
