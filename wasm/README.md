# WASM Build Environment

Build environment untuk mengkompilasi OnlyOffice ke WebAssembly menggunakan Emscripten.

---

## Cara Build

### Build standar (versi `dev`)

```bash
docker compose run build
```

### Build dengan versi spesifik

```bash
VERSION=v1.0.0 docker compose run build
```

---

## Output

Hasil build tersimpan di folder `output/` di root repo.

> **Jangan commit folder `output/`** — folder ini ada di `.gitignore` dan di-upload via CI/CD ke Cloudflare R2.

---

## Requirements

- **Docker Desktop** dengan **WSL2 backend** (Windows)
- Submodule `web-apps` dan `build_tools` sudah di-init (`git submodule update --init --recursive`)

---

## Struktur File

```
wasm/
├── Dockerfile   ← image Emscripten + dependencies
├── build.sh     ← script build utama
└── README.md    ← dokumen ini
```
