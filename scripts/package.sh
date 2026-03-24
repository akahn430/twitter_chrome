#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/build/twitter-feed-blocker"
DIST_DIR="$ROOT_DIR/dist"
ZIP_PATH="$DIST_DIR/twitter-feed-blocker-chrome.zip"

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR" "$DIST_DIR"

cp "$ROOT_DIR/manifest.json" "$BUILD_DIR/"
cp "$ROOT_DIR/content.js" "$BUILD_DIR/"
cp "$ROOT_DIR/styles.css" "$BUILD_DIR/"

(
  cd "$BUILD_DIR"
  zip -r "$ZIP_PATH" manifest.json content.js styles.css >/dev/null
)

echo "Packaged extension: $ZIP_PATH"
