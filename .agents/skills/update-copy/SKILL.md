---
name: update-copy
description: Change or remove existing user-facing copy in editor-ui, starting from a GitHub issue. Use when asked to update, reword, replace or remove UI text, translation strings or en.json copy from an issue. Not for adding new copy.
argument-hint: <github issue URL>
---

# Update copy from a GitHub issue

Input: $ARGUMENTS (a GitHub issue URL). Adding new copy is out of scope: say
so and leave it for a human. Stop at both checkpoints and wait for the user.

## 1. Read the issue

```bash
gh issue view <number> --repo <owner/repo> --json title,body,comments
```

Use `--json` (plain output can be empty). Read the comments; scope often
changes there. List each change: action (change / remove), current text, new
text, where it appears. Broad issues ("remove all beta references") need a
search.

## 2. Find every match

Use `git grep` and quote globs (zsh breaks unquoted ones).

```bash
git grep -n -i "<term>" -- public/translations/en.json
git grep -n -i "<term>" -- src cypress ':!*.snap'
```

For each en.json key, find its usages (`git grep -n "<key>"`). Unit tests
assert on keys (i18n is mocked); Cypress specs assert on English text.

Sort matches into:

- **In scope:** clearly what the issue means.
- **Related but different:** same word, different feature.
- **Not visible:** unused keys, or behind an attribute or flag hosts don't set.
- **Code names only:** component, file, class or key names. Not part of the
  copy change (see step 8).

Check neighbours: text to remove may share a string with copy or a link that
should stay.

## 3. Checkpoint 1: confirm the plan

Show a table per key: old text, new text or removed, usages, affected tests.
List related and not-visible matches separately and ask whether to include
them. Don't edit until confirmed. Also raise:

- **Partial removals:** offer to reword the string (recommended) rather than
  remove copy or a link that should stay.
- **Tag count changes:** other locales keep the old `Trans` tags until Crowdin
  syncs, so they may show old wording without its link.

Once confirmed, give the UI location (as in step 6) and ask the user to take
"before" screenshots (desktop and mobile) now, while the old copy shows.

## 4. Make the change

- Edit only `public/translations/en.json`; Crowdin overwrites other locales.
- Keep `{{placeholders}}`, `_one`/`_other` suffixes and `<0>…</0>` tags; tag
  count must match the `Trans` `components`.
- **Removing a key needs a code change**, or the page shows the raw key.
  Remove or adjust the `t()` usage (use optional props where they exist) and
  tell the user.
- If an element would be left empty or broken, or needs restructuring, ask.
- Remove what only the removed element used (URL constants, imports, SCSS);
  grep to confirm.
- Red then green: add or adjust a test, run it and confirm it fails, then make
  it pass. Rename test titles that mention the old wording.
- The global `react-i18next` mock (`src/utils/setupTests.vitest.js`) drops
  `Trans` `components`. To test links, add a local `vi.mock` like the one in
  `src/components/Editor/AiErrorMessage/AiErrorMessage.test.jsx`.
- Update Cypress specs that match the old English text.

## 5. Check

```bash
yarn eslint --fix <edited js/jsx files>   # sed edits often break Prettier
CI=true yarn test <affected test files>
yarn lint >/dev/null 2>&1; echo lint=$?
python3 -c "import json; json.load(open('public/translations/en.json'))"
```

Add `yarn stylelint` if SCSS changed. Don't run Cypress unless asked; name
changed specs so they can be checked in CI.

## 6. Checkpoint 2: what to check in the UI

The user runs the dev server. For each changed string give:

- a URL on `http://localhost:3011/web-component.html`: query params become
  web component attributes and `?project=<name>` loads a sample project (see
  `web-component.html`)
- the state that shows it (an error, a sidebar panel, a setting)
- where to look and any layout risk (much longer text, an empty gap)

Wait for the user to confirm. Ask them to take "after" screenshots and drag
all before and after files into the chat, which gives their paths (usually on
the Desktop). If an image arrives without a path, ask for it: `--attach`
needs a file. Never copy screenshots into the repo.

## 7. Commit and draft PR (only when asked)

- `gh pr create --draft`. Branch `<issue number>-<short-slug>`; check the
  current branch first.
- Commits: short subject plus a line on why. One commit per kind of change
  (copy, rename, key rename) so each can be reverted.
- PR description: link `owner/repo#number`, where the change shows, only
  `en.json` edited (Crowdin does the rest), any renames, references left out
  on purpose. Don't touch `CHANGELOG.md`.
- End with a `## Screenshots` before/after table (desktop and mobile rows)
  and attach the user's files with `--attach`, following the
  `github-attachments` skill. Macroscope needs them to approve. If there are
  no screenshots, leave the section empty and remind the user to fill it in.
- Use a quoted heredoc (`<<'EOF'`) and don't backslash-escape inside it.

## 8. Renames (only when asked, after the copy commit)

- **Components, files, classes, ids:** `git mv`; grep all uses (styles,
  analytics, tests) and check new names are free. Ask the user to recheck the
  UI.
- **Translation keys:** ask first. Crowdin treats a renamed key as new, so
  other locales fall back to English until retranslated. Rename in `en.json`
  and code only, give the commit hash for `git revert`, and fix tests that
  check the old key is absent (they'd pass regardless).

## Final report

Short: changed files (links), tests updated, checks and results, what to check
in the UI, what was left out and why.
