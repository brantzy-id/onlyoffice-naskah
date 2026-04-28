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

- [x] `security` — Disable all network requests to OnlyOffice servers *(see log below)*
- [x] `hooks` — Add postMessage event emitter (editor:ready, document:changed, document:saved, selection:changed, wordcount:updated, error:occurred) *(see log below)*
- [x] `hooks` — Add postMessage command handler (open, save, getContent, setTheme, setLocale, enableFocusMode, disableFocusMode, insertText) *(see log below)*
- [ ] `branding` — Replace OnlyOffice logo with Naskah logo
- [x] `branding` — Change color scheme to Naskah Blue (#2563EB) and Naskah Purple (#7C3AED) *(see log below)*
- [x] `branding` — Replace fonts with Inter and Plus Jakarta Sans *(see log below)*
- [x] `localization` — Translate UI strings to Bahasa Indonesia *(see log below)*
- [x] `localization` — Integrate id_ID dictionary for Indonesian spell checking *(see log below)*
- [x] `performance` — Remove unused features to reduce WASM binary size *(see log below)*

---

## Modification Log

> Entries will appear here as modifications are applied.
> Most recent modification is listed first.

## [2025-07-26] — performance — Skip PDF editor and Visio editor from build

- **Files modified:**
  - `build/Gruntfile.js` — Added `deploy-naskah` Grunt task that builds only `common`, `documenteditor`, `spreadsheeteditor`, `presentationeditor`, and `pdfeditor` components. Skips `visioeditor` only.
  - `wasm/build.sh` — Changed `grunt --target=documenteditor` (invalid option, only built 1 editor) to `grunt deploy-naskah` (builds all 4 needed editors correctly).
- **Patch file:** `patches/performance/skip-unused-editors.patch`
- **Reason:** Naskah Platform uses Document Editor, Spreadsheet Editor, Presentation Editor, and PDF Editor. Building Visio Editor adds unnecessary compile time and output size. The `deploy-naskah` task is additive — the original `default` task is unchanged for upstream compatibility.

## [2025-07-26] — localization — Indonesian (id-ID) spell check dictionary

- **Files added:**
  - `dictionaries/id_ID/id_ID.aff` — Hunspell affix rules for Indonesian (LGPL-3.0, from LibreOffice/hunspell-id 2022)
  - `dictionaries/id_ID/id_ID.dic` — Hunspell word list for Indonesian, 46,905 entries
- **Patch file:** N/A — new binary/data files, not a source patch
- **Reason:** `build_tools/scripts/base.py:copy_dictionaries()` copies `dictionaries/{lang}/{lang}.aff` + `{lang}.dic` into the final product bundle. Without these files the WASM spell check engine has no Indonesian word list to load. The `LanguageInfo.js` entry for `0x0421` (id-ID) already exists with a 3-element array so the language will appear in the UI dropdown once the WASM reports it available via `asc_onSpellCheckInit`. Dictionary source: https://github.com/LibreOffice/dictionaries (id/id_ID.*). License: LGPL-3.0-only.

## [2025-07-26] — localization — Translate UI strings to Bahasa Indonesia

- **Files modified:**
  - `apps/documenteditor/main/locale/id.json` — Filled 777 missing keys with English fallback (merge via `translation/merge_and_check.py`)
  - `apps/documenteditor/embed/locale/id.json` — Filled 11 missing keys
  - `apps/documenteditor/forms/locale/id.json` — Filled 16 missing keys
  - `apps/documenteditor/mobile/locale/id.json` — Filled 21 missing nested keys
  - `apps/pdfeditor/main/locale/id.json` — Filled 1,433 missing keys (PDF editor was only 53% complete)
  - `apps/presentationeditor/main/locale/id.json` — Filled 808 missing keys
  - `apps/presentationeditor/embed/locale/id.json` — Filled 7 missing keys
  - `apps/presentationeditor/mobile/locale/id.json` — Filled 21 missing nested keys
  - `apps/spreadsheeteditor/main/locale/id.json` — Filled 973 missing keys
  - `apps/spreadsheeteditor/embed/locale/id.json` — Filled 7 missing keys
  - `apps/spreadsheeteditor/mobile/locale/id.json` — Filled 33 missing nested keys
  - `apps/visioeditor/embed/locale/id.json` — Filled 49 missing keys
  - `apps/visioeditor/mobile/locale/id.json` — Filled 4 missing keys
  - `apps/visioeditor/main/locale/id.json` *(new file)* — Created from en.json (481 keys); visioeditor previously had no id.json
- **Patch files:** `patches/localization/translate-id-main.patch`, `patches/localization/translate-id-embed-mobile.patch`
- **Reason:** The existing id.json files contain official OnlyOffice Crowdin translations (Bahasa Indonesia) but were last synced before several feature releases, leaving ~4,100 keys missing. Missing keys now fall back to English (standard OnlyOffice i18n behavior), ensuring all UI strings are visible. Keys already translated by Crowdin are preserved verbatim.

## [2025-07-25] — hooks — NaskahBridge postMessage integration

- **Files modified:**
  - `apps/common/NaskahBridge.js` *(new file)* — Self-contained postMessage bridge as `window.NaskahBridge` singleton. Emits typed events to parent window and dispatches incoming `naskah:` commands to editor internals.
  - `apps/documenteditor/main/app/controller/Main.js` — Added `window.NaskahBridge && window.NaskahBridge.setApi(this.api)` after api init.
  - `apps/spreadsheeteditor/main/app/controller/Main.js` — Same.
  - `apps/presentationeditor/main/app/controller/Main.js` — Same.
  - `apps/pdfeditor/main/app/controller/Main.js` — Same.
  - `apps/pdfeditor/main/app.js` — Added `naskahbridge` path alias and shim dependency; added to RequireJS `require()` call.
  - `apps/visioeditor/main/app/controller/Main.js` — Same.
  - `build/documenteditor.json` — Added `../apps/common/NaskahBridge.js` to JS concat src list.
  - `build/spreadsheeteditor.json` — Same.
  - `build/presentationeditor.json` — Same.
  - `build/visioeditor.json` — Same.
- **Patch file:** `patches/hooks/naskah-bridge.patch`
- **Reason:** Naskah Platform requires bidirectional communication between the editor iframe and the host application. Events emitted: `naskah:editor:ready`, `naskah:document:changed`, `naskah:document:saved`, `naskah:selection:changed`, `naskah:wordcount:updated`, `naskah:error:occurred`. Commands handled: `naskah:save`, `naskah:getContent`, `naskah:open`, `naskah:setTheme`, `naskah:setLocale`, `naskah:enableFocusMode`, `naskah:disableFocusMode`, `naskah:insertText`.

## [2025-07-25] — branding — Naskah color scheme and fonts

- **Files modified:**
  - `apps/common/main/resources/less/colors-table-classic.less` — Changed toolbar header colors to Naskah Blue (#2563EB) for document/spreadsheet/pdf and Naskah Purple (#7C3AED) for presentation/visio. Updated accent button and tab underline colors to match.
  - `apps/common/main/resources/less/colors-table-gray.less` — Updated `--background-accent-button` to #2563EB.
  - `apps/common/main/resources/less/colors-table-dark.less` — Updated `--background-accent-button` to #3B82F6 (WCAG-safe dark variant of Naskah Blue).
  - `apps/common/main/resources/less/colors-table-night.less` — Same as dark.
  - `apps/common/main/resources/less/colors-table-dark-contrast.less` — Same as dark.
  - `apps/common/main/resources/less/variables.less` — Updated `@font-family-sans-serif` to prefer Inter and Plus Jakarta Sans with Arial/Helvetica fallbacks. The parent page is responsible for loading these fonts (no CDN requests).
- **Patch file:** `patches/branding/colors-fonts.patch`
- **Reason:** Naskah Platform visual identity uses #2563EB (Naskah Blue) and #7C3AED (Naskah Purple). Fonts Inter and Plus Jakarta Sans are the platform's typeface system. Logo change omitted — the OnlyOffice logo is used as-is per AGPL § 7(b) trademark requirement.

## [2025-07-24] — security — Disable all network requests to OnlyOffice/third-party servers

- **Files modified:**
  - `apps/common/Analytics.js` — Replaced Google Analytics loader with no-op stub. Original code dynamically injected `<script>` loading `ga.js` from `google-analytics.com`. Now `initialize()` and `trackEvent()` are empty functions.
  - `apps/documenteditor/main/app/controller/Toolbar.js` — Removed hardcoded `https://www.onlyoffice.com/blog/...` URL from "Learn More" tooltip links.
  - `apps/spreadsheeteditor/main/app/controller/Toolbar.js` — Same as above.
  - `apps/presentationeditor/main/app/controller/Toolbar.js` — Same as above.
  - `apps/pdfeditor/main/app/controller/Toolbar.js` — Same as above.
  - `apps/common/main/lib/view/MacrosDialog.js` — Removed `window.open('https://api.onlyoffice.com/...')` call in `onHelp()`.
- **Patch file:** `patches/security/disable-network-requests.patch`
- **Reason:** Naskah Platform must not leak any data to third-party servers (OnlyOffice, Google Analytics). Analytics was already disabled via `&& false` guard upstream, but the implementation code remained. This patch makes the no-op permanent and removes all hardcoded external URLs.