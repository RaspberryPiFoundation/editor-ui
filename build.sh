# !/bin/bash
# https://developers.cloudflare.com/pages/how-to/build-commands-branches/

if [ "$CF_PAGES_BRANCH" != "production" ]; then
  yarn run build
else
  yarn run build
fi
