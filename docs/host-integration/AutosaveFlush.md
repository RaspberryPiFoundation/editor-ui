# Autosave flush before navigation

The editor autosaves while the user is editing, but saves are throttled. If the
host navigates away (React Router, another SPA router, or a full page leave)
before that throttle fires, unsaved edits can be lost.

`<editor-wc>` exposes a small API so the host can ask “is a save needed?” and,
if so, force a save before leaving.

## When to use this

**Use it when** the host controls navigation away from a mounted editor that
may have unsaved edits. This matters most for SPA hosts: a route change often
does not unload the page, so the browser’s normal leave hooks may not run the
way you expect.

**Do not treat it as** a replacement for normal autosave. While the user stays
on the page, the editor’s own autosave continues to run. Flush is for leaving.

The web component also listens for `pagehide` / `beforeunload` internally and
will try to flush on a full page leave. Host-driven SPA navigation still needs
an explicit check + flush from the host.

## API

All of these functions are properties available on the `<editor-wc>` element.

### `shouldFlushBeforeNavigation` (getter → boolean)

`true` when autosave is enabled and the project has changed since the last
known clean state (worth saving before leave).

Use this to decide whether to block navigation or call flush at all.

### `flushPendingAutoSave()` → `Promise`

Force-saves now: skips the normal throttle, waits for any in-flight save if
needed, then saves. Resolves when the flush finishes; rejects if the save
fails.

Safe to call when nothing is dirty - it no-ops when autosave is disabled or
there is nothing to save.

### Related getters (optional)

| Property | Meaning |
| --- | --- |
| `hasPendingAutoSave` | `true` when the project is dirty and there is outstanding autosave work (queued, in flight, or still inside the throttle window). A subset of `shouldFlushBeforeNavigation`: dirty alone is not enough. |
| `codeChangedSinceInitialLoad` | Whether project files/name/instructions differ from what was loaded initially. Useful for “has the user edited?” UI; not the same as the navigation flush check. |

`shouldFlushBeforeNavigation` answers “should we save before leaving?” - autosave is enabled and the project has unsaved changes.

`hasPendingAutoSave` answers “is autosave already mid-pipeline?” It requires dirty *and* outstanding work (a queued save, an in-flight request, or the post-save throttle window). Dirty alone is not enough: after an edit, there can be a quiet gap (for example a debounce pause) where the project has changed but nothing is queued or in flight yet. In that window `hasPendingAutoSave` is `false` even though the user’s work is still unsaved.

That is why leave handling should use `shouldFlushBeforeNavigation` + `flushPendingAutoSave`, not `hasPendingAutoSave`. Checking only `hasPendingAutoSave` would skip the flush in those quiet gaps and risk losing edits. Use `hasPendingAutoSave` only if you need to know whether autosave work is already under way (for example UI that shows a saving indicator).

## Vanilla JS / HTML example

```js
const editor = document.querySelector("editor-wc");

async function leaveEditor(navigate) {
  if (editor?.shouldFlushBeforeNavigation) {
    try {
      await Promise.race([
        editor.flushPendingAutoSave(),
        // Don't wait forever if the save hangs - still allow navigation after 10s.
        new Promise((resolve) => setTimeout(resolve, 10_000)),
      ]);
    } catch {
      // Save failed - still allow navigation so the user is not stuck.
    }
  }

  navigate();
}
```

Check first if you want to avoid an unnecessary round trip; calling flush
unconditionally is also fine when you are about to leave anyway.

## React / SPA example

Pattern used by Code Classroom (`editor-standalone`):

1. A React Router blocker asks `editor.shouldFlushBeforeNavigation`.
2. If true, navigation pauses.
3. The host awaits `flushPendingAutoSave()` (with a timeout).
4. Navigation proceeds whether the flush succeeded, failed, or timed out.

See `editor-standalone/src/hooks/useSaveProjectBeforeNavigation.js`
(used in `ProjectComponentLoader`).

A simplified version of that pattern:

```js
import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

const FLUSH_TIMEOUT_MS = 10_000;

function useSaveBeforeLeave() {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (currentLocation.pathname === nextLocation.pathname) return false;
    const editor = document.querySelector("editor-wc");
    return editor?.shouldFlushBeforeNavigation ?? false;
  });

  useEffect(() => {
    if (blocker.state !== "blocked") return;

    let cancelled = false;
    const editor = document.querySelector("editor-wc");
    const proceed = blocker.proceed;

    const done = () => {
      if (!cancelled) proceed();
    };

    if (!editor?.flushPendingAutoSave) {
      done();
      return;
    }

    const flush = Promise.resolve()
      .then(() => editor.flushPendingAutoSave())
      .catch(() => {
        // If the save fails, swallow the error so navigation can still proceed.
      });

    Promise.race([
      flush,
      // Don't wait forever if the save hangs - still allow navigation after the timeout.
      new Promise((resolve) => setTimeout(resolve, FLUSH_TIMEOUT_MS)),
    ]).then(done);

    return () => {
      cancelled = true;
    };
  }, [blocker.state, blocker.proceed]);
}
```

## Checking vs always flushing

| Approach | When it helps |
| --- | --- |
| Check `shouldFlushBeforeNavigation`, flush only if true | Skip work when nothing changed; good for blockers that should stay quiet on clean navigations |
| Always `await flushPendingAutoSave()` before leave | Simpler control flow; flush no-ops when clean |

Either is fine. Classroom uses the check so the router only blocks when a save
is actually needed.

## Timeouts and failures

`flushPendingAutoSave` can reject (network error, API error, and so on). A
hung request can also leave a `await` waiting forever.

Recommended host behaviour:

- Race the flush against a timeout (classroom uses 10 seconds).
- On failure or timeout, **still allow navigation** - better to risk a rare
  lost edit than trap the user on the page.
- Optionally surface a toast or log; do not require the user to retry before
  leaving unless your product explicitly wants that.

## Leaving the editor

| Behaviour | Who should flush |
| --- | --- |
| Leaving the editor without a full browser page unload (e.g. SPA route change: `/projects/a` → `/projects/b`) | Host - call the API from your router blocker / navigation guard. The document stays loaded, so `pagehide` / `beforeunload` do not run and the editor’s unload listeners never fire. |
| Leaving the editor with a full browser page unload (tab close, refresh, navigating away from the site) | Editor also listens for `pagehide` / `beforeunload` and attempts a flush. Hosts may still want `beforeunload` UX (“you have unsaved changes”) based on `shouldFlushBeforeNavigation`. |

If your app can leave the editor without unloading the page (typical SPA routing), do not rely on full-page unload hooks alone - flush from the host before navigation proceeds.
