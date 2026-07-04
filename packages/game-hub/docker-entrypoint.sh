#!/bin/sh
set -eu

escape_js() {
  printf '%s' "$1" | sed "s/'/\\\\'/g"
}

GIPHY_KEY_ESCAPED=$(escape_js "${VITE_GIPHY_API_KEY:-}")

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__NASMONO_ENV__ = {
  VITE_GIPHY_API_KEY: '${GIPHY_KEY_ESCAPED}',
};
EOF

exec nginx -g 'daemon off;'
