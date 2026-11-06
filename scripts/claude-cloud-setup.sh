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
# Cypress is not run in cloud sessions: it crashes behind the sandbox proxy
# (read ECONNRESET), so CI's test-cypress job is the e2e check. We skip the
# Cypress binary download, which also keeps the allowlist short.
#
# Network: the cloud environment's allowlist can only be set in the claude.ai
# UI, so we check REQUIRED_HOSTS first. If any are blocked we stop and tell
# both the user and Claude which ones to add.
set -euo pipefail

# Hosts the cloud environment must allow, beyond the default trusted list.
REQUIRED_HOSTS=(
  repo.yarnpkg.com # Yarn release that corepack downloads
)

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}"

log() { echo ">>> $*" >&2; }

# Any HTTP response (even 4xx) means the host is reachable. A blocked host
# fails at the connection or proxy CONNECT step, so curl exits non-zero.
check_hosts() {
  local dir host blocked=()
  dir="$(mktemp -d)"
  for host in "${REQUIRED_HOSTS[@]}"; do
    (curl -s -o /dev/null --max-time 10 "https://$host/" ||
      touch "$dir/$host") &
  done
  wait
  for host in "${REQUIRED_HOSTS[@]}"; do
    [ -e "$dir/$host" ] && blocked+=("$host")
  done
  rm -rf "$dir"
  if [ "${#blocked[@]}" -gt 0 ]; then
    local msg="Cloud setup stopped: this environment's network allowlist is"
    msg+=" missing ${blocked[*]}. Ask an org Owner to add them"
    msg+=" (claude.ai/code > environment settings > Network access: Custom,"
    msg+=" keep the default list) and start a new session. Node 24,"
    msg+=" dependencies and .env were not set up."
    log "$msg"
    # systemMessage is shown to the user; additionalContext goes to Claude.
    printf '{"systemMessage":"%s","hookSpecificOutput":{%s,%s}}\n' \
      "$msg" '"hookEventName":"SessionStart"' "\"additionalContext\":\"$msg\""
    exit 0
  fi
}
check_hosts

node_version="$(awk '$1 == "nodejs" { print $2 }' .tool-versions)"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  log "Installing nvm"
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh \
    | PROFILE=/dev/null bash >&2
fi
# shellcheck source=/dev/null
. "$NVM_DIR/nvm.sh"

# Ask nvm, not the node on PATH: a system node of the same version doesn't
# mean nvm has it, and `nvm use` below would then fail.
if [ "$(nvm version "$node_version")" = "N/A" ]; then
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

# Node's built-in fetch, which corepack uses to download Yarn, ignores
# HTTPS_PROXY unless this is set; without it corepack fails with ENOTFOUND.
export NODE_USE_ENV_PROXY=1
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0
corepack enable >&2

if [ ! -f .env ]; then
  log "Creating .env from .env.example"
  cp .env.example .env
fi

log "Installing dependencies"
CYPRESS_INSTALL_BINARY=0 yarn install --immutable >&2

echo "Cloud setup done: Node $(node --version), Yarn $(yarn --version)," \
  "dependencies installed."
