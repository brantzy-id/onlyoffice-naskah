# Modifications to OnlyOffice

This document lists all modifications made to the original OnlyOffice `web-apps`
source code as required by the **GNU Affero General Public License v3 (AGPL v3)**.

Any use, distribution, or deployment of this modified software must comply with
the AGPL v3 license terms, including making this modification log publicly available.

---

## Base Information

| Item | Detail |
|---|---|
| Original Repository | https://github.com/ONLYOFFICE/web-apps |
| Original License | GNU Affero General Public License v3 |
| Fork Repository | https://github.com/brantzy-id/onlyoffice-web-apps |
| This Repository | https://github.com/brantzy-id/onlyoffice-naskah |
| Maintainer | brantzy-id |
| Purpose | Modified OnlyOffice editor compiled to WebAssembly for Naskah Platform |

---

## How to Read This Document

Each entry follows this format:

```
## [YYYY-MM-DD] — Category — Short description

- **Files modified:** list of files changed
- **Patch file:** patches/category/filename.patch
- **Reason:** why this modification was necessary
```

**Categories:**
- `branding` — visual identity changes (logo, colors, fonts)
- `security` — hardening, disabling external network requests
- `hooks` — postMessage event emitter and command handler
- `performance` — build size and runtime optimizations
- `localization` — Indonesian language support and spell checker

---

## Pending Modifications

The following modifications are planned but not yet applied.
This section will be moved to the log below as each is completed.

- [ ] `security` — Disable all network requests to OnlyOffice servers
- [ ] `hooks` — Add postMessage event emitter (editor:ready, document:changed, document:saved, selection:changed, wordcount:updated, error:occurred)
- [ ] `hooks` — Add postMessage command handler (open, save, getContent, setTheme, setLocale, enableFocusMode, disableFocusMode, insertText)
- [ ] `branding` — Replace OnlyOffice logo with Naskah logo
- [ ] `branding` — Change color scheme to Naskah Blue (#2563EB) and Naskah Purple (#7C3AED)
- [ ] `branding` — Replace fonts with Inter and Plus Jakarta Sans
- [ ] `localization` — Translate UI strings to Bahasa Indonesia
- [ ] `localization` — Integrate id_ID dictionary for Indonesian spell checking
- [ ] `performance` — Remove unused features to reduce WASM binary size

---

## Modification Log

> Entries will appear here as modifications are applied.
> Most recent modification is listed first.

<!-- Template untuk entri baru:

## [YYYY-MM-DD] — Category — Short description

- **Files modified:**
  - `apps/documenteditor/main/...`
- **Patch file:** `patches/category/filename.patch`
- **Reason:** ...

-->