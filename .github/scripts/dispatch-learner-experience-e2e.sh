#!/usr/bin/env bash
set -euo pipefail

# Dispatch learner-experience-integration-tests after staging WC deploy.
#
# Expects env:
#   TOKEN, SHA, REF, DEPLOY_URL, COMMIT_MESSAGE_INPUT, PR_NUMBER, NOTIFY_ON_SUCCESS
# Optional:
#   GITHUB_STEP_SUMMARY (set automatically in GitHub Actions)

if [ -n "${COMMIT_MESSAGE_INPUT}" ]; then
  COMMIT_MESSAGE="${COMMIT_MESSAGE_INPUT}"
else
  COMMIT_MESSAGE="$(git log -1 --pretty=%B "${SHA}" 2>/dev/null || true)"
fi

if [ -z "${COMMIT_MESSAGE}" ]; then
  COMMIT_MESSAGE="(no commit message)"
fi

# Truncate for Slack; head -c can cut mid-multibyte char which is fine here.
COMMIT_MESSAGE="$(printf '%s' "${COMMIT_MESSAGE}" | head -c 80)"

# workflow_call booleans arrive as the strings "true" / "false"
if [ "${NOTIFY_ON_SUCCESS}" = "true" ]; then
  NOTIFY_JSON=true
else
  NOTIFY_JSON=false
fi

PAYLOAD="$(
  jq -n \
    --arg repo "editor-ui" \
    --arg sha "${SHA}" \
    --arg ref "${REF}" \
    --arg commit_message "${COMMIT_MESSAGE}" \
    --arg deploy_url "${DEPLOY_URL}" \
    --arg triggered_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg pr "${PR_NUMBER}" \
    --argjson notify_on_success "${NOTIFY_JSON}" \
    '{
      event_type: "learner-experience-test",
      client_payload: (
        {
          repo: $repo,
          sha: $sha,
          ref: $ref,
          commit_message: $commit_message,
          deploy_url: $deploy_url,
          triggered_at: $triggered_at,
          notify_on_success: $notify_on_success
        }
        + (if $pr == "" then {} else {pr: $pr} end)
      )
    }'
)"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "### Dispatch payload"
    echo '```json'
    echo "${PAYLOAD}"
    echo '```'
  } >> "${GITHUB_STEP_SUMMARY}"
fi

echo "Payload:"
echo "${PAYLOAD}"

if [ -z "${TOKEN}" ]; then
  echo "LEARNER_EXPERIENCE_TESTS_DISPATCH_TOKEN is not set"
  exit 1
fi

curl -fsS -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/RaspberryPiFoundation/learner-experience-integration-tests/dispatches \
  --data-raw "${PAYLOAD}"

echo "repository_dispatch accepted (204)"
