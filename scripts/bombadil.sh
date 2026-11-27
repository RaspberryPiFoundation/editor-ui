#!/usr/bin/env bash
# Run Bombadil (https://github.com/antithesishq/bombadil) property-based UI
# tests against the local web component test page. See docs/Bombadil.md.
#
# Usage:
#   yarn test:bombadil [extra bombadil options...]
#
# Environment variables:
#   BOMBADIL_PROJECT     Sample project to start from (src/projects/*.json,
#                        name without .json). Default: cool-html
#   BOMBADIL_TIME_LIMIT  How long to explore, e.g. 30s, 5m, 1h. Default: 2m
#   BOMBADIL_HEADED      Set to 1 to watch the browser instead of running
#                        headless.
#   BOMBADIL_SPEC        Specification file. Default: bombadil/spec.ts
#   BOMBADIL_ORIGIN      Dev server origin. Default: http://localhost:3011
#
# Extra arguments are passed to `bombadil browser test`, e.g.
#   yarn test:bombadil --exit-on-violation
# The time limit, headless mode, output path and --reproduce are set by this
# script; to control those yourself, run `yarn bombadil browser test`.
#
# If nothing is serving BOMBADIL_ORIGIN and it is a localhost origin, the
# Vite dev server is started on its port for the duration of the run.
set -euo pipefail

cd "$(dirname "$0")/.."

PROJECT="${BOMBADIL_PROJECT:-cool-html}"
TIME_LIMIT="${BOMBADIL_TIME_LIMIT:-2m}"
SPEC="${BOMBADIL_SPEC:-bombadil/spec.ts}"
ORIGIN="${BOMBADIL_ORIGIN:-http://localhost:3011}"
ORIGIN="${ORIGIN%/}"
URL="${ORIGIN}/web-component.html?project=${PROJECT}"
OUTPUT_DIR="bombadil-output/${PROJECT}-$(date +%Y%m%d-%H%M%S)"
DEV_LOG="bombadil-output/dev-server.log"

log() { echo ">>> $*" >&2; }

for arg in "$@"; do
  case "$arg" in
    --time-limit | --time-limit=* | --headless | --output-path | \
      --output-path=* | --output-path-overwrite | --reproduce | --reproduce=*)
      log "$arg is set by this script" \
        "(see BOMBADIL_TIME_LIMIT / BOMBADIL_HEADED)."
      log "To pass it yourself, run: yarn bombadil browser test ..."
      exit 1
      ;;
  esac
done

if [ ! -f "src/projects/${PROJECT}.json" ]; then
  log "Unknown sample project '${PROJECT}'. Choose one of:"
  for f in src/projects/*.json; do
    f="${f##*/}"
    log "  ${f%.json}"
  done
  exit 1
fi

# The editor's .env URLs (PUBLIC_URL, ASSETS_URL, HTML_RENDERER_URL) point at
# http://localhost:3011. With any other origin, even 127.0.0.1:3011, the HTML
# renderer frame is cross-origin and the preview checks can't see into it.
if [ "$ORIGIN" != "http://localhost:3011" ]; then
  log "Note: the URLs in .env (PUBLIC_URL, ASSETS_URL, HTML_RENDERER_URL)"
  log "must use ${ORIGIN} too, or the HTML preview checks will fail."
fi

# HTTP status of the test page, or 000 if nothing answered.
page_status() {
  curl -s --connect-timeout 2 --max-time 10 -o /dev/null -w '%{http_code}' \
    "${ORIGIN}/web-component.html" || true
}
server_up() { [ "$(page_status)" = "200" ]; }

DEV_SERVER_PID=""
BOMBADIL_PID=""
cleanup() {
  if [ -n "$BOMBADIL_PID" ]; then
    kill -INT -- "-${BOMBADIL_PID}" 2>/dev/null || true
  fi
  if [ -n "$DEV_SERVER_PID" ]; then
    log "Stopping dev server (pid ${DEV_SERVER_PID})"
    # yarn spawns vite as a child; kill the whole process group.
    kill -- "-${DEV_SERVER_PID}" 2>/dev/null ||
      kill "$DEV_SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

dev_server_failed() {
  log "$1"
  if [ -f "$DEV_LOG" ]; then
    log "Last lines of ${DEV_LOG}:"
    tail -n 20 "$DEV_LOG" >&2
  fi
  exit 1
}

status_code="$(page_status)"
if [ "$status_code" = "200" ]; then
  log "Using the dev server already running at ${ORIGIN}"
elif [ "$status_code" != "000" ]; then
  log "Something else is serving ${ORIGIN}" \
    "(HTTP ${status_code} for /web-component.html)."
  log "Stop it, or point BOMBADIL_ORIGIN at the editor's dev server."
  exit 1
else
  if ! [[ "$ORIGIN" =~ ^http://(localhost|127\.0\.0\.1):([0-9]+)$ ]]; then
    log "Nothing is serving ${ORIGIN}. Start the editor there first."
    exit 1
  fi
  PORT="${BASH_REMATCH[2]}"
  if [ ! -f .env ]; then
    log "No .env found, copying .env.example"
    cp .env.example .env
  fi
  log "Starting dev server on port ${PORT} (logs in ${DEV_LOG})"
  mkdir -p bombadil-output
  # set -m gives the background job its own process group so cleanup can
  # stop vite as well as yarn.
  set -m
  yarn start --port "$PORT" --strictPort > "$DEV_LOG" 2>&1 &
  DEV_SERVER_PID=$!
  set +m
  for _ in $(seq 1 60); do
    server_up && break
    if ! kill -0 "$DEV_SERVER_PID" 2>/dev/null; then
      DEV_SERVER_PID=""
      dev_server_failed "Dev server exited early."
    fi
    sleep 1
  done
  server_up || dev_server_failed "Dev server did not come up on ${ORIGIN}."
fi

HEADLESS_FLAG="--headless"
if [ "${BOMBADIL_HEADED:-}" = "1" ]; then
  HEADLESS_FLAG=""
fi

mkdir -p "$OUTPUT_DIR"
log "Exploring ${URL} for ${TIME_LIMIT} with ${SPEC}"
log "Output: ${OUTPUT_DIR}"

# Run Bombadil in its own process group and wait for it, so a signal sent to
# this script reaches Bombadil itself (yarn runs it via node, and signalling
# only yarn would orphan it). Bombadil shuts its Chrome down on SIGINT but
# not on SIGTERM, so every signal is forwarded as SIGINT.
stop_bombadil() {
  if [ -n "$BOMBADIL_PID" ]; then
    kill -INT -- "-${BOMBADIL_PID}" 2>/dev/null || true
  fi
}
trap stop_bombadil INT TERM HUP

set -m
yarn bombadil browser test \
  ${HEADLESS_FLAG} \
  --time-limit "$TIME_LIMIT" \
  --output-path "$OUTPUT_DIR" \
  --output-path-overwrite \
  "$@" \
  "$URL" "$SPEC" &
BOMBADIL_PID=$!
set +m
status=0
wait "$BOMBADIL_PID" || status=$?
# A trapped signal interrupts `wait`; wait again for yarn to exit.
while kill -0 "$BOMBADIL_PID" 2>/dev/null; do
  status=0
  wait "$BOMBADIL_PID" || status=$?
done
# On SIGINT, yarn and its node wrapper exit at once while the Bombadil
# binary (same process group) is still writing its trace and closing
# Chrome. Wait for the whole group before stopping the dev server.
for _ in $(seq 1 150); do
  kill -0 -- "-${BOMBADIL_PID}" 2>/dev/null || break
  sleep 0.2
done
kill -KILL -- "-${BOMBADIL_PID}" 2>/dev/null || true
BOMBADIL_PID=""

if [ -f "${OUTPUT_DIR}/trace.jsonl" ]; then
  # The reproduce command keeps passed-through options, except
  # --exit-on-violation, which can't be combined with --reproduce.
  reproduce=(yarn bombadil browser test)
  [ -n "$HEADLESS_FLAG" ] && reproduce+=("$HEADLESS_FLAG")
  reproduce+=(--reproduce "$OUTPUT_DIR")
  for arg in "$@"; do
    [ "$arg" = "--exit-on-violation" ] || reproduce+=("$arg")
  done
  reproduce+=("$URL" "$SPEC")

  echo >&2
  if [ "$status" -eq 2 ]; then
    log "Property violations found (exit code 2)." \
      "See docs/Bombadil.md for known ones."
  fi
  log "Inspect the run:  yarn bombadil browser inspect ${OUTPUT_DIR}"
  log "Reproduce it:     $(printf '%q ' "${reproduce[@]}")"
fi
exit "$status"
