#!/bin/bash
set -e

# Ambil versi dari argumen pertama; default ke "dev" jika tidak diberikan
VERSION="${1:-dev}"

echo "Building OnlyOffice WASM version: $VERSION"

# Masuk ke direktori build_tools yang di-mount sebagai submodule
cd /workspace/build_tools

# Jalankan configure.py untuk menyiapkan konfigurasi build
# --module web-apps  : hanya build modul web-apps
# --update 0         : jangan pull/update submodule (source sudah di-mount)
# --branch ""        : tidak ada branch spesifik yang di-checkout
echo "Configuring build..."
python3 configure.py --module web-apps --update 0 --branch ""

# Jalankan proses build utama
echo "Running make..."
python3 make.py

# Salin hasil build ke direktori output yang di-mount dari host
echo "Build complete. Copying output..."
cp -r /workspace/build_tools/out/. /output/

echo "Done. Output in /output"
