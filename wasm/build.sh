#!/bin/sh
set -e

VERSION="${1:-dev}"

echo "Building OnlyOffice web-apps version: $VERSION"

# Masuk ke build directory
cd /workspace/web-apps/build

# Install node dependencies
echo "Installing dependencies..."
npm install

# Build only the 3 editors used by Naskah Platform
# (document, spreadsheet, presentation — skip pdfeditor and visioeditor)
echo "Running Grunt build (naskah target)..."
./node_modules/.bin/grunt deploy-naskah

# Copy hasil build ke /output
echo "Copying output to /output..."
mkdir -p /output
cp -r ../deploy/. /output/ 2>/dev/null || cp -r ../build/. /output/ 2>/dev/null || true

# Copy Service Worker ke root output agar bisa diakses sebagai /sw.js
if [ -f /workspace/sw/sw.js ]; then
  cp /workspace/sw/sw.js /output/sw.js
  echo "sw.js copied to output"
fi

echo "Done. Output in /output"
ls /output