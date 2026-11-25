#!/usr/bin/env bash
# =========================================================
# Monta a pasta que vai para o GitHub Pages (padrão: _site/).
# Só entram os arquivos que o site usa. Ficam de fora o README, as migrações do
# Supabase, os scripts e a pasta .github: nada disso precisa estar público.
#
# Uso manual:   bash scripts/preparar-publicacao.sh [pasta]
# No GitHub, o workflow "Publicar no GitHub Pages" roda este script depois das
# verificações de segurança e publica a pasta.
# Arquivo novo no site? Acrescente em PUBLICOS abaixo.
# =========================================================
set -euo pipefail
cd "$(dirname "$0")/.."
destino="${1:-_site}"

PUBLICOS=(index.html sw.js manifest.webmanifest css js vendor icons screenshots)

rm -rf "$destino"
mkdir -p "$destino"
for item in "${PUBLICOS[@]}"; do
  [ -e "$item" ] || { echo "Falta o arquivo do site: $item" >&2; exit 1; }
  cp -R "$item" "$destino/"
done
# Sem processamento do Jekyll: o GitHub Pages entrega os arquivos exatamente como estão
touch "$destino/.nojekyll"

# Todo arquivo que o app guarda para abrir sem internet (sw.js) precisa estar publicado
faltando=$(grep -oE '"\./[^"]*"' sw.js | tr -d '"' | sed 's#^\./##' | while read -r f; do
  [ -z "$f" ] && continue
  [ -e "$destino/$f" ] || echo "$f"
done)
if [ -n "$faltando" ]; then
  echo "O sw.js guarda arquivos que não foram publicados:" >&2
  echo "$faltando" >&2
  exit 1
fi
echo "Publicação pronta em $destino ($(find "$destino" -type f | wc -l | tr -d ' ') arquivos)."
