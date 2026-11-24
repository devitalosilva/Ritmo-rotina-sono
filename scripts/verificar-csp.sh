#!/usr/bin/env bash
# =========================================================
# Confere se o index.html continua compatível com a CSP de _headers.
# A CSP só deixa rodar scripts que são ARQUIVOS do site (js/, vendor/). Se alguém
# colar um <script> com código dentro do HTML, um onclick="..." ou um link
# javascript:, isso não roda no site publicado. Este teste avisa antes.
#
# Uso manual:   bash scripts/verificar-csp.sh
# No GitHub, roda sozinho junto com a verificação de segredos.
# =========================================================
set -u
cd "$(dirname "$0")/.." || exit 1
problemas=""

# 1. <script> sem src (dados JSON-LD são permitidos: não executam)
linhas=$(grep -nE '<script(\s[^>]*)?>' index.html | grep -vE '<script[^>]*\ssrc=' | grep -viE 'application/ld\+json')
[ -n "$linhas" ] && problemas="${problemas}Script escrito dentro do HTML (mova para js/app.js):"$'\n'"$linhas"$'\n'

# 2. Atributos de evento (onclick=, onload=...) e links javascript:
linhas=$(grep -nE '<[a-zA-Z][^>]*\son[a-z]+\s*=' index.html)
[ -n "$linhas" ] && problemas="${problemas}Atributo de evento no HTML (use addEventListener em js/app.js):"$'\n'"$linhas"$'\n'
linhas=$(grep -niE 'href\s*=\s*["'"'"']?\s*javascript:' index.html js/*.js)
[ -n "$linhas" ] && problemas="${problemas}Link javascript: (não roda com a CSP):"$'\n'"$linhas"$'\n'

# 3. <style> dentro do HTML (a CSP só aceita css/app.css e o Google Fonts)
linhas=$(grep -nE '<style(\s[^>]*)?>' index.html)
[ -n "$linhas" ] && problemas="${problemas}Bloco <style> dentro do HTML (mova para css/app.css):"$'\n'"$linhas"$'\n'

# 4. eval e parecidos (a CSP não tem 'unsafe-eval')
linhas=$(grep -nE '(^|[^.a-zA-Z_])eval\(|new Function\(|setTimeout\(\s*["'"'"'`]|setInterval\(\s*["'"'"'`]' js/*.js)
[ -n "$linhas" ] && problemas="${problemas}eval / new Function / setTimeout com texto (não rodam com a CSP):"$'\n'"$linhas"$'\n'

# 5. A CSP precisa continuar sem 'unsafe-inline' e sem 'unsafe-eval' nos scripts
csp=$(grep -m1 'Content-Security-Policy:' _headers)
script_src=$(printf '%s' "$csp" | grep -oE "script-src [^;]*")
case "$script_src" in
  *unsafe-inline*|*unsafe-eval*) problemas="${problemas}_headers: script-src voltou a liberar 'unsafe-inline' ou 'unsafe-eval'."$'\n' ;;
esac

if [ -n "$problemas" ]; then
  printf 'ATENÇÃO: o site não vai funcionar como esperado com a CSP:\n%s' "$problemas"
  exit 1
fi
echo "HTML compatível com a CSP: nenhum script, estilo ou evento embutido."
