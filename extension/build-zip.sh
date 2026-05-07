#!/bin/bash
# Build the Chrome Web Store submission ZIP.
# Run from the project root: ./extension/build-zip.sh
# Output: extension-vX.Y.Z.zip in the project root.

set -euo pipefail

cd "$(dirname "$0")/.."   # project root

VERSION=$(grep '"version"' extension/manifest.json | head -1 | sed -E 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/')
OUTFILE="extension-v${VERSION}.zip"

echo "▶ Building $OUTFILE …"

# Clean any previous build artifact
rm -f "$OUTFILE"

# Zip just what Chrome Web Store needs. Exclude internal scripts.
cd extension
zip -r "../$OUTFILE" . \
  -x '*.DS_Store' \
  -x 'build-zip.sh' \
  -x '*.swp' \
  -x '.gitignore' \
  >/dev/null
cd ..

echo "✅ $OUTFILE created ($(du -h "$OUTFILE" | cut -f1))"
echo ""
echo "次のステップ:"
echo "1. https://chrome.google.com/webstore/devconsole で '新しい拡張機能を追加'"
echo "2. $OUTFILE をアップロード"
echo "3. ストア掲載情報を docs/CHROME_STORE_LISTING.md からコピペ"
