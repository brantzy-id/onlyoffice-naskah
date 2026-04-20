# Copilot Instructions — OnlyOffice Naskah (WASM Fork)
> Repo: `brantzy-id/onlyoffice-naskah` | Lisensi: AGPL v3 | Bersifat Publik
> Baca seluruh file ini sebelum menghasilkan kode atau konfigurasi apapun.

---

## Identitas Repo Ini

Repo ini adalah **fork publik OnlyOffice** yang dimodifikasi untuk kebutuhan platform Naskah.
Repo ini bukan tempat kode bisnis Naskah — hanya build tooling dan patch OnlyOffice.

```
brantzy-id/onlyoffice-naskah    ← repo ini (Public, AGPL)
├── web-apps/                   ← submodule: fork brantzy-id/onlyoffice-web-apps
│                                  (ini yang dimodifikasi — patch diterapkan di sini)
├── build_tools/                ← submodule: ONLYOFFICE/build_tools (upstream, read-only)
├── patches/                    ← patch files per kategori
│   ├── branding/
│   ├── security/
│   ├── hooks/
│   ├── performance/
│   └── localization/
├── dictionaries/
│   └── id_ID/                  ← kamus spell checker Bahasa Indonesia
├── sw/
│   └── sw.js                   ← Service Worker untuk cache WASM di browser
├── output/                     ← hasil build — TIDAK di-commit, upload via CI/CD
├── wasm/
│   ├── Dockerfile              ← build environment Emscripten
│   ├── build.sh                ← script build
│   └── README.md
├── MODIFICATIONS.md            ← WAJIB diperbarui setiap ada perubahan (syarat AGPL)
└── docker-compose.yml          ← jalankan build dengan: docker compose run build

Repo platform (closed source) ada di lokasi terpisah:
masmutdevofficial/naskah-platform  ← TIDAK ada hubungannya dengan repo ini
```

---

## Git Identity untuk Repo Ini

- GitHub account: `brantzy-id`
- SSH remote: `git@github-brantzy-id:brantzy-id/onlyoffice-naskah.git`
- SSH Host alias: `github-brantzy-id`
- SSH IdentityFile: `C:/Users/pc/.ssh/id_ed25519_brantzy`

Setiap perintah `git push`, `git remote add`, atau `git clone` untuk repo ini
selalu gunakan format SSH di atas — bukan HTTPS.

---

## Batasan Absolut (Non-Negotiable)

```
❌ TIDAK BOLEH: kode NestJS, Nuxt, TypeScript bisnis Naskah masuk ke repo ini
❌ TIDAK BOLEH: credential, API key, secret apapun masuk ke repo ini
❌ TIDAK BOLEH: commit file binary WASM (.wasm) — output/ ada di .gitignore
❌ TIDAK BOLEH: modifikasi submodule build_tools — pakai as-is dari upstream
❌ TIDAK BOLEH: network request dari WASM ke server OnlyOffice asli
❌ TIDAK BOLEH: skip update MODIFICATIONS.md setelah ada perubahan ke web-apps
```

Repo ini **publik** — semua yang di-commit bisa dilihat siapapun.

---

## Aturan AGPL — WAJIB Dipatuhi

OnlyOffice menggunakan lisensi **AGPL v3**. Artinya semua modifikasi
terhadap source code OnlyOffice **wajib dipublikasikan**.

**`MODIFICATIONS.md` harus selalu diperbarui** setiap kali ada perubahan ke `web-apps/`.
Format entri:

```markdown
## [YYYY-MM-DD] — Kategori — Deskripsi singkat

- File yang diubah: `path/ke/file.js`
- Patch file: `patches/kategori/nama-patch.patch`
- Alasan: Jelaskan mengapa modifikasi ini diperlukan
```

Kategori yang valid: `branding`, `security`, `hooks`, `performance`, `localization`

---

## Cara Kerja Build

```
web-apps/ (source JS/CSS OnlyOffice)
    +
build_tools/ (Emscripten toolchain)
    │
    ▼
docker compose run build
    │
    ▼
output/ (hasil: .wasm + .js + assets)
    │
    ▼
CI/CD upload ke Cloudflare R2
cdn.naskah.id/wasm/v{VERSION}/
```

Perintah build:
```bash
# Build WASM
docker compose run build

# Hasil ada di output/
# JANGAN commit output/ ke Git
```

---

## Modifikasi yang Harus Diterapkan ke web-apps/

Ini adalah daftar lengkap modifikasi yang perlu dilakukan, diurutkan berdasarkan prioritas:

### 1. Security — Nonaktifkan Network Request (PRIORITAS PERTAMA)
Semua network request dari WASM ke server OnlyOffice asli harus dinonaktifkan.
Ini mencegah data dokumen user dikirim ke server pihak ketiga.

Cari dan nonaktifkan endpoint seperti:
- `https://doceditor.onlyoffice.com`
- `https://documentserver`
- Semua `XMLHttpRequest` atau `fetch` ke domain OnlyOffice

### 2. Hooks — postMessage Bridge
Tambahkan event emitter dan command handler via `postMessage`.

**Event yang dikirim dari editor ke parent (Nuxt host):**
```javascript
window.parent.postMessage({ type: 'editor:ready' }, '*')
window.parent.postMessage({ type: 'document:changed', payload: { isDirty: true } }, '*')
window.parent.postMessage({ type: 'document:saved', payload: { versionId: '...' } }, '*')
window.parent.postMessage({ type: 'selection:changed', payload: { text: '...', range: {} } }, '*')
window.parent.postMessage({ type: 'wordcount:updated', payload: { words: 100, chars: 500 } }, '*')
window.parent.postMessage({ type: 'error:occurred', payload: { code: '...', message: '...' } }, '*')
```

**Command yang diterima dari parent:**
```javascript
window.addEventListener('message', (event) => {
  const command = event.data
  switch (command.type) {
    case 'open':              // payload: { url, token, documentId }
    case 'save':              // tidak ada payload
    case 'getContent':        // tidak ada payload
    case 'setTheme':          // payload: { theme: 'light' | 'dark' }
    case 'setLocale':         // payload: { locale: 'id' | 'en' }
    case 'enableFocusMode':   // tidak ada payload
    case 'disableFocusMode':  // tidak ada payload
    case 'insertText':        // payload: { text: string }
  }
})
```

### 3. Branding — Visual Identity Naskah
- Logo: ganti logo OnlyOffice dengan logo Naskah
- Warna primer: `#2563EB` (Naskah Blue)
- Warna sekunder: `#7C3AED` (Naskah Purple)
- Font: `Inter` dan `Plus Jakarta Sans`
- String UI: terjemahkan ke Bahasa Indonesia

### 4. Localization — Kamus id_ID
Integrasikan kamus spell checker Bahasa Indonesia dari `dictionaries/id_ID/`
ke spell checker bawaan OnlyOffice.

---

## Kewajiban Pasca-Tugas

Setiap kali menyelesaikan satu item dari checklist:

### 1. Update MODIFICATIONS.md

Tambahkan entri baru di `MODIFICATIONS.md` dengan format:

```markdown
## [YYYY-MM-DD] — Kategori — Deskripsi

- File: `web-apps/path/ke/file`
- Patch: `patches/kategori/nama.patch`
- Alasan: ...
```

### 2. Simpan Patch File

Setelah memodifikasi file di `web-apps/`, buat patch file-nya:

```bash
# Buat patch dari perubahan di web-apps
cd web-apps
git diff > ../patches/kategori/nama-perubahan.patch
```

Ini penting agar modifikasi bisa di-reapply saat upstream OnlyOffice diupdate.

### 3. Commit dengan Pesan yang Jelas

```bash
# Format commit message
git add .
git commit -m "feat(hooks): add postMessage event emitter for editor:ready and document:changed"

# Format: tipe(kategori): deskripsi singkat
# Tipe: feat, fix, chore, docs, refactor
# Kategori: branding, security, hooks, performance, localization, build
```

---

## Service Worker — sw/sw.js

Service Worker harus meng-cache file WASM agar tidak perlu download ulang setiap kali user membuka editor.

File yang di-cache:
- `naskah-editor.wasm` — binary utama (paling besar)
- `naskah-editor.js` — glue code Emscripten
- `index.html` — shell HTML editor
- `dictionaries/id_ID.aff` dan `id_ID.dic` — kamus spell checker

Strategi: **cache-first** untuk semua file WASM.

---

## CI/CD — GitHub Actions

Workflow ada di `.github/workflows/build.yml`.

Trigger:
- Push ke branch `main` dengan perubahan di `web-apps/` atau `wasm/`
- Manual dispatch (untuk force rebuild)

Langkah:
1. Checkout repo + submodules
2. Build WASM dengan Docker Emscripten
3. Upload `output/` ke Cloudflare R2 di path `wasm/v{VERSION}/`
4. Update environment variable `NUXT_PUBLIC_WASM_VERSION` di repo platform

Secrets yang dibutuhkan di GitHub repo settings:
```
CF_R2_ACCESS_KEY_ID
CF_R2_SECRET_ACCESS_KEY
CF_R2_BUCKET_NAME
CF_R2_ENDPOINT
```

---

## Checklist Sebelum Push

- [ ] Perubahan ke `web-apps/` sudah didokumentasikan di `MODIFICATIONS.md`
- [ ] Patch file sudah dibuat di `patches/kategori/`
- [ ] Tidak ada credential atau secret di kode yang di-commit
- [ ] Tidak ada file `output/` yang masuk ke commit
- [ ] Tidak ada kode bisnis Naskah (NestJS/Nuxt/TypeScript platform) di commit ini
- [ ] `build_tools/` tidak dimodifikasi
- [ ] Commit message mengikuti format `tipe(kategori): deskripsi`