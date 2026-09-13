#!/bin/zsh
# Local production deploy to Cloudflare Workers. Sources .env.cloudflare
# (CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID — gitignored) so no global
# `wrangler login` is needed. Prerenders when a Chrome binary is available,
# matching what CI does.
set -e
cd "$(dirname "$0")/.."
if [[ -f .env.cloudflare ]]; then set -a; source .env.cloudflare; set +a; fi

npm run build

MAC_CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ -z "$PUPPETEER_EXECUTABLE_PATH" && -x "$MAC_CHROME" ]]; then
  export PUPPETEER_EXECUTABLE_PATH="$MAC_CHROME"
fi
npm run prerender   # no-op (with a warning) if no Chrome path is set

npx wrangler deploy "$@"
