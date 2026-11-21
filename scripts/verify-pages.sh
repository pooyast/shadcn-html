#!/usr/bin/env bash
set -euo pipefail

origin="${1:?Pass the Pages deployment origin}"
workdir="$(mktemp -d)"
trap 'rm -rf "$workdir"' EXIT

curl --retry 6 --retry-all-errors -fsSL "$origin/" -o "$workdir/home.html"
grep -q '<title>.*shadcn-html' "$workdir/home.html"

for asset in components/dialog/dialog.css components/combobox/combobox.js; do
  curl --retry 6 --retry-all-errors -fsSL "$origin/$asset" -o "$workdir/asset"
  cmp "$workdir/asset" "dist/$asset"
done
