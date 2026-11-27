---
name: update-copy
description: Change or remove existing user-facing copy in editor-standalone or editor-ui, starting from a GitHub issue. Use when asked to update, reword, replace or remove UI text, translation strings or en.json copy from an issue. Not for adding new copy.
argument-hint: <github issue URL>
---

# Update copy from a GitHub issue

Input: $ARGUMENTS (a GitHub issue URL). The issue describes, in prose, which
text to change or remove. Adding new copy is out of scope: if the issue asks
for it, say so and leave that part for a human.

The user checks the UI and reviews the PR themselves. Stop at the two
checkpoints below and wait for them.

## 1. Read the issue

```bash
gh issue view <number> --repo <owner/repo> --json title,body,comments
```

Plain `gh issue view` can print nothing, so use `--json`. Read the comments
too, since scope often changes there.

Pull out each change as: action (change / remove), current text, new text,
where it appears. Issues are often broad (for example "remove all beta
references"), so you need to search for what matches.

## 2. Find every match

Search the whole repo, not only `src/`. editor-standalone also has code under
`apps/classroom` and `apps/editor`. Use `git grep`, which skips
`node_modules`. Unquoted globs fail in zsh (`--include=*.js`,
`apps/*/cypress`), so quote them as git pathspecs.

```bash
git grep -n -i "<term>" -- public/translations/en.json
git grep -n -i "<term>" -- src apps cypress 'apps/**/cypress/**' ':!*.snap'
```

For each matching en.json key, find where code uses it
(`git grep -n "<key>"`). Also search tests for the literal English text:

- Unit tests usually assert on the translation key, because i18n is mocked.
- Cypress tests assert on the English text (`cy.contains("button", "Create class")`).

Sort what you find into:

- **In scope:** clearly what the issue means.
- **Related but different:** same word, different product or feature (for
  example "Code Classroom is in beta" when the issue is about the Blocks
  editor).
- **Not visible to users:** keys no code uses, or that only show behind a flag
  that nothing sets.
- **Code names only:** component, file, CSS class or key names that contain
  the term. Leave these out of the copy change. Step 8 covers renaming them
  if the user wants it.

Also look at what each string sits next to. If text to remove shares a string
with copy or a link that should stay (for example "X is in beta. Complete this
survey…"), the issue rarely says which it means.

## 3. Checkpoint 1: confirm the plan

Show the user a short table of each key: old text, new text or removed, where
it is used, which tests are affected. List the related and not-visible matches
separately and ask whether to include them. Do not edit until the user
confirms.

Also raise, where they apply:

- **Partial removals:** if removing text would also remove copy or a link
  that should stay, offer to reword the string instead (recommended) or remove
  it all.
- **Tag count changes:** if a `Trans` string loses or gains a tag, other
  locales keep the old tags until Crowdin syncs, so a translated page may show
  the old wording without its link until then.

## 4. Make the change

- Edit only `public/translations/en.json`. Never edit other locale files:
  Crowdin overwrites them.
- Keep placeholders (`{{name}}`), plural suffixes (`_one`, `_other`) and
  `<0>…</0>` tags intact, and keep the same number of tags as the `Trans`
  component's `components` array.
- **Removing a key always needs a code change too.** If the component still
  calls `t("the.key")`, the page shows the raw key text. Remove or adjust the
  usage, using the component's optional props where it has them (for example
  `<Banner>` without `badge`). Tell the user this is a small code change on
  top of en.json.
- If removing the text would leave an element empty or broken, or the
  component needs restructuring, stop and ask.
- Remove whatever the removed element alone used: help URL constants,
  imports, SCSS rules. Grep each one to confirm nothing else uses it.
- Work red then green: first add or adjust a test that fails, for example
  asserting the removed key is no longer rendered, then make it pass. Rename
  test titles that mention the old wording. Run the test before the change
  and confirm it fails; a test that already passes checks nothing.
- The global Jest mock for `react-i18next` (`config/jest/setupTests.js` in
  editor-standalone) renders `Trans` as `children || i18nKey` and drops
  `components`, so tests can't see links inside a `Trans` string. To test
  them, add a local mock in that test file:

  ```js
  jest.mock("react-i18next", () => {
    const { createElement } = require("react");
    return {
      useTranslation: () => ({
        t: (str, props) => (props?.returnObjects ? [str] : str),
      }),
      Trans: ({ i18nKey, components }) =>
        createElement("span", null, i18nKey, ...components),
    };
  });
  ```
- Update Cypress tests and page objects that match the old English text.

## 5. Check

Format the files you edited (bulk `sed` edits often leave lines that are too
long for Prettier), run the affected unit tests, then lint:

```bash
yarn eslint --fix <edited js/jsx/ts/tsx files>
CI=true yarn test <paths to affected test files>
yarn lint >/dev/null 2>&1; echo lint=$?
```

Add `yarn stylelint` if SCSS changed and `yarn typecheck` if TypeScript
changed.

Check `en.json` still parses:

```bash
python3 -c "import json; json.load(open('public/translations/en.json'))"
```

Do not run Cypress unless the user asks. Name any Cypress specs you changed so
they can be checked in CI.

## 6. Checkpoint 2: tell the user what to check in the UI

For each changed string, give:

- the route, found from the app's route files (for example
  `apps/classroom/src/components/AppRoutes/ClassroomAppRoutes.jsx` in
  editor-standalone), written like `/{locale}/school/project/{identifier}`
- which role or state shows it (teacher only, a Blocks project, a feature
  flag)
- what to look at: where on the page it is, and any layout risk (a string that
  is now much longer, or an empty space where removed text was)

Then stop and wait for the user to confirm the UI looks right.

## 7. Commit and open a draft PR (only when the user asks)

- Always open the PR as a draft: `gh pr create --draft`.

- Branch name: `<issue number>-<short-slug>`. Check the current branch first;
  the user may have created it already.
- Commit message: a short subject, plus one or two lines on why.
- Use a separate commit for each kind of change (the copy change, a
  component or class rename, a key rename), so any of them can be reverted on
  its own.
- PR description: check `.github/` for a PR template first. Otherwise a few
  lines. Link the issue as `owner/repo#number`, name the page that changed,
  say only `en.json` was edited (other locales come from Crowdin), list any
  renames, and list related references left out on purpose.
- End the description with an empty `## Screenshots` section (desktop and
  mobile, before and after) and remind the user to fill it in. Macroscope
  requires UI evidence before it approves.
- Use a quoted heredoc (`<<'EOF'`) for the description and do not
  backslash-escape quotes or backticks inside it, or the escapes appear
  literally.
- `gh pr edit` may fail because the token lacks `read:org`. To change the
  description after creating the PR, use:

  ```bash
  gh api -X PATCH repos/<owner>/<repo>/pulls/<n> -f body="$BODY"
  ```

## 8. Optional: rename code names (only when the user asks)

After the copy change is committed, the user may want the old term out of
component, file, CSS class or key names too. Do each kind of rename as its own
commit.

- **Components, files, CSS classes, ids:** use `git mv` so history follows.
  First grep for every use of the old names (including `id`s used by
  styles, analytics or tests) and check the new names are not already taken.
  Name the new component after what the UI shows (for example the section
  heading). Do not convert to TypeScript unless asked. Ask the user to recheck
  the UI, since every style hangs on the class names.
- **Translation keys:** never rename without asking. Explain the cost first:
  Crowdin treats a renamed key as a new string, so other locales fall back to
  English for those strings until they are translated again. Strings whose
  text has changed need translating again anyway. If the user goes ahead,
  rename the key only in `en.json` and in code, and give them the commit hash
  so they can `git revert` it. Update tests that check an old key is not
  rendered, since after the rename they pass whatever the code does. A check
  like `queryByText(/<term>/i)` keeps working.

## Final report

Keep it short: what changed (file links), tests updated, checks run and
their results, what the user should check in the UI, and what was left out
and why.
