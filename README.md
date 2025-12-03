# FM-DX Webserver Ban Sync — Database Branch README

This branch contains the synchronized ban-list database used by all interconnected FM-DX Webserver and TEF deployments.

Only the ban database should be modified here. **Do not commit plugin code to this branch.**

---

## Database File Location

```
ban-sync-db/db.json
```

Direct link:  
https://github.com/shortcircuit404/FM-DX-Webserver-Ban-Sync/blob/database/ban-sync-db/db.json

---

## JSON Schema Overview

Each banned user entry uses the following schema:

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

## Field Definitions

- **id** — Incremental numeric identifier.  
- **ipv4_addresses / ipv6_addresses** — IPs tied to the user.  
- **browser_useragents** — Known browser User-Agent strings.  
- **usernames** — Any usernames associated with the user.  
- **ban_reason** — Detailed explanation for the ban.  
- **evidence_links** — Logs, screenshots, or other proof.  
- **auto_banned** — True if system automatically banned them.  
- **bot_activity** — Indicates bot-like behavior.  
- **hogging_tef_server** — Frequency monopolization or TEF misuse.  
- **controversial_reasoning** — Ban reasoning outside typical rule violations.  
- **drama_related** — Behavior involving harassment or conflict.  
- **other_unspecified_reasons** — Miscellaneous category.  
- **ban_date** — UTC ISO timestamp of when the ban was added.  
- **updated_date** — UTC ISO timestamp for latest modification.  

---

## Contribution Rules

### ✔ All pull requests must target the `database` branch

Do not modify the `main` branch unless editing the plugin code.

### ✔ Only modify `ban-sync-db/db.json`

Avoid altering other files unless coordinated with maintainers.

### ✔ Never overwrite or remove existing entries

- Update only when new verified information becomes available.  
- Always update **updated_date** on modifications.  
- Never reuse an **id**.

### ✔ Provide full reasoning and supporting evidence

A valid entry requires:

- Full **ban_reason**  
- **evidence_links** (if available)  
- Accurate metadata (IPs, UA strings, usernames)  
- Correct timestamps  

### ✔ Appealing a Ban

If you believe your ban is incorrect:

**Ban Appeal Form:**  
*Replace this section with the correct link.*

---

## Pull Request Instructions

1. Fork repository  
2. Checkout the **database** branch  
3. Edit `ban-sync-db/db.json`  
4. Validate JSON formatting  
5. Commit with a descriptive message  
6. Open a PR targeting the **database** branch  
7. Await review  
