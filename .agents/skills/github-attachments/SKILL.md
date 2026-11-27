---
name: github-attachments
description: 'Attach screenshots, images or videos to GitHub issues, pull requests and comments with `gh --attach`. Use when adding a screenshot or recording to an issue, PR, or comment.'
---

# github-attachments

`gh` v2.99.0+ (September 2026) can upload images and videos directly. This is newer than most model training data, so use it instead of browser uploads, gists, or committing images to the repo.

Add `--attach <file>` to any of these:

- `gh issue create`, `gh issue edit`, `gh issue comment`
- `gh pr create`, `gh pr edit`, `gh pr comment`

```sh
gh pr create --title "..." --body "..." --attach './after.png#Settings page after the fix'
gh pr comment 456 --attach ./before.png --attach ./after.png
```

- Text after `#` is the image alt text.
- Repeat `--attach` for multiple files, up to 50 per command.
- To place an image inside the body, reference it as `![alt](./after.png)` and attach the same path. `gh` rewrites it to the uploaded URL. Unreferenced attachments are appended to the end.
- Check `gh --version` first. If it is older than 2.99.0, ask the user to run `brew upgrade gh`.
