#!/usr/bin/env bash
# =========================================================
# Procura chaves secretas do Supabase no projeto antes de enviar ao GitHub.
# O site só pode ter a chave PÚBLICA (sb_publishable_... ou anon). A service_role / sb_secret_
# ignora o RLS e daria acesso a todos os dados.
#
# Uso manual:   bash scripts/verificar-segredos.sh
# Antes de cada commit (opcional):
#   printf '#!/bin/sh\nbash scripts/verificar-segredos.sh\n' > .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
# No GitHub, o mesmo teste roda sozinho (.github/workflows/verificar-segredos.yml).
# =========================================================
set -u
cd "$(dirname "$0")/.." || exit 1
achados=""

# 1. Chaves secretas novas (sb_secret_...) e variáveis com a service_role preenchida
linhas=$(grep -rnE 'sb_secret_[A-Za-z0-9_-]{10,}|SERVICE_ROLE_KEY[[:space:]]*[=:][[:space:]]*["'"'"']?[A-Za-z0-9._-]{20,}' \
  --exclude-dir=.git --exclude-dir=node_modules --exclude=verificar-segredos.sh . 2>/dev/null)
[ -n "$linhas" ] && achados="$achados$linhas"$'\n'

# 2. Chaves antigas em formato JWT: abre cada uma e procura "role": "service_role"
for jwt in $(grep -rhoE 'eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}' \
    --exclude-dir=.git --exclude-dir=node_modules . 2>/dev/null | sort -u); do
  carga=$(printf '%s' "$jwt" | cut -d. -f2 | tr '_-' '/+')
  while [ $(( ${#carga} % 4 )) -ne 0 ]; do carga="$carga="; done
  if printf '%s' "$carga" | base64 -d 2>/dev/null | grep -q '"service_role"'; then
    achados="${achados}JWT com role service_role: ${jwt:0:20}..."$'\n'
  fi
done

if [ -n "$achados" ]; then
  printf 'ATENÇÃO: chave secreta encontrada. Remova antes de enviar:\n%s' "$achados"
  exit 1
fi
echo "Nenhuma chave secreta encontrada."
