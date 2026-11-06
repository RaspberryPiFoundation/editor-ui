#!/usr/bin/env bash
# SessionStart hook for Claude Code cloud sessions (claude.ai/code).
#
# The cloud base image ships Node 20-22, but this repo pins Node in
# .tool-versions, so we install that version with nvm, enable corepack for
# Yarn 4, create .env from .env.example and install dependencies.
#
# It is a no-op outside the cloud (CLAUDE_CODE_REMOTE is unset locally), so
# local sessions are unaffected. Progress goes to stderr; stdout is added to
# Claude's context, so keep it to a one-line summary.
#
# Network: the cloud environment must allow download.cypress.io and
# cdn.cypress.io (Cypress binary) and editor-assets.raspberrypi.org (Pyodide).
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"

log() { echo ">>> $*" >&2; }

node_version="$(awk '$1 == "nodejs" { print $2 }' .tool-versions)"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  log "Installing nvm"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \
    | PROFILE=/dev/null bash >&2
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

if [ "$(node --version 2>/dev/null)" != "v$node_version" ]; then
  log "Installing Node $node_version"
  nvm install "$node_version" >&2
fi
nvm alias default "$node_version" >/dev/null
nvm use "$node_version" >/dev/null
node_bin="$(dirname "$(nvm which "$node_version")")"

# Make the pinned Node (and corepack's yarn) the default for Claude's shells.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo "export PATH=\"$node_bin:\$PATH\"" >>"$CLAUDE_ENV_FILE"
fi

corepack enable >&2

if [ ! -f .env ]; then
  log "Creating .env from .env.example"
  cp .env.example .env
fi

log "Installing dependencies"
yarn install --immutable >&2

echo "Cloud setup done: Node $(node --version), Yarn $(yarn --version)," \
  "dependencies installed."
