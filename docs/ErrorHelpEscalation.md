# Escalating error help

> **Status: exploratory demo.** Off unless `REACT_APP_OLLAMA_URL` is set, and it
> only ever talks to a model on `localhost`. Nothing here is a production or
> hosted inference path.

## Summary

When Python code fails, the editor shows the raw error and — when the
[python-friendly-error-messages](https://github.com/RaspberryPiFoundation/python-friendly-error-messages)
copydeck matches — a one-line friendly explanation. That covers the first two
levels of the RPF "levels of learner support in dealing with errors" framework.
Nothing covered the levels beyond that, and nothing helped at all when the
copydeck had no match.

This adds the remaining rungs below the friendly message, one click at a time.
The first rung is pre-written copy that the copydeck already contained but the
editor was discarding; the rungs after it come from a small language model
running under Ollama.

## The ladder

| Rung | Framework level | Source | Trigger |
|---|---|---|---|
| — | Present | raw traceback (`ErrorMessage`) | always |
| — | Explain and suggest | copydeck `title` + `summary` (`FriendlyErrorMessage`) | always, when matched |
| 1 | Explain and suggest (fuller) | copydeck `why` + `steps`, **no network call** | "Explain this to me" |
| 2 | Hint and direct | model, `hint` level instruction | "I'm still stuck" |
| 3 | Solve | model, `solve` level instruction | "Show me the fix" |

Progressive disclosure is a named requirement in the design system's
[age appropriate guidelines](https://design-system.rpf-internal.org) under
"reduce cognitive load", which is why the ladder only ever advances on an
explicit click and never pre-empts the learner.

Rung 1 exists because `friendlyExplain`'s `sections` option filters only the
assembled HTML, not the structured result — `why`, `steps` and `patch` come back
regardless. The editor was requesting `["title", "summary"]` and dropping the
rest, so human-reviewed copy for the next level of support was already there and
unused. `src/utils/friendlyErrorPayload.js` now calls the library twice, once for
each snippet, and both are put in redux under `state.editor.friendlyError`.

When `friendlyExplain` returns `null` — no copydeck entry for that error, which
is the real coverage gap — rung 1 is skipped and the first click asks the model
at an `explain` level instead.

## Configuration

Env vars, overridable per tab by URL parameter. There is deliberately no web
component attribute for any of this: it should not become part of the host API
until it has earned it.

| Variable | Default | Effect |
|---|---|---|
| `REACT_APP_OLLAMA_URL` | unset | Empty or unset hides the model rungs entirely. Rung 1 is unaffected. |
| `REACT_APP_OLLAMA_MODEL` | `llama3.2:3b` | Any model pulled into the local Ollama. |

Vite's `envPrefix` is `REACT_APP_` and the codebase reads `process.env`, not
`import.meta.env`. Both need an entry in `browserProcessEnvValues` in
`vite.lib.js` — that allowlist is what reaches the browser, and a variable
missing from it is simply `undefined` at runtime with no error.

### Comparing models across tabs

Comparing candidates is the point of the prototype, so `?ollama_model=` overrides
the env var for that tab. One `ollama serve` then serves as many models as you
have pulled:

```
/web-component.html?ollama_model=gemma2:2b
/web-component.html?ollama_model=phi4-mini:latest
/web-component.html?ollama_model=qwen3.5:4b
```

The model that produced each answer is shown beside the AI tag, so a screenshot
is self-describing without checking the address bar.

#### Candidates

Click a model to open the demo running it. These are the candidates from
`slm-evaluation`'s `db/models.yml`; sizes and quantisation are as Ollama reports
them locally. `ollama pull <name>` first if you have not already.

| Open the demo with | Size | Params | Quant | Licence |
|---|---|---|---|---|
| [`smollm2:360m`](http://localhost:3011/web-component.html?ollama_model=smollm2:360m) | 0.7 GB | 362M | F16 | Apache-2.0 |
| [`qwen3.5:0.8b`](http://localhost:3011/web-component.html?ollama_model=qwen3.5:0.8b) | 1.0 GB | 873M | Q8_0 | Apache-2.0 |
| [`gemma2:2b`](http://localhost:3011/web-component.html?ollama_model=gemma2:2b) | 1.6 GB | 2.6B | Q4_0 | Gemma Terms of Use |
| [`llama3.2:3b`](http://localhost:3011/web-component.html?ollama_model=llama3.2:3b) | 2.0 GB | 3.2B | Q4_K_M | Llama 3.2 Community |
| [`phi4-mini:latest`](http://localhost:3011/web-component.html?ollama_model=phi4-mini:latest) | 2.5 GB | 3.8B | Q4_K_M | MIT |
| [`qwen3.5:4b`](http://localhost:3011/web-component.html?ollama_model=qwen3.5:4b) | 3.4 GB | 4.7B | Q4_K_M | Apache-2.0 |

The links assume the dev server on its default port — if `PUBLIC_URL` differs,
change the host but keep the query string.

`llama3.2:3b` is the default because it was the best behaved of the ones tried at
a size that answers in a couple of seconds. Anything Ollama can serve works, so
[`smollm2:135m`](http://localhost:3011/web-component.html?ollama_model=smollm2:135m)
is a link too — it was pulled locally during this work, but it is not an
evaluation candidate.

Licence notes worth carrying, from `models.yml`: Gemma 2 is **not open source**
and its use restrictions must be passed on to anyone you distribute to; Llama 3.2
is **not open source** either, ships with its agreement and acceptable-use policy,
and needs a separate Meta licence above 700M monthly users. The Apache-2.0 and MIT
candidates carry none of that. Both Qwen models are reasoning models, so
`think: false` matters most for them (see above).

What was observed locally, on the `NameError` cases only — treat it as a smoke
test, not a result; the scoring lives in `slm-evaluation`:

- `phi4-mini:latest` and `llama3.2:3b` followed the level instructions most
  reliably.
- `gemma2:2b` was the worst for asking the learner questions they cannot answer.
- `smollm2:360m` produced invalid Python and self-contradicting explanations.
  Its own note in `models.yml` calls it "the floor, weak at code".

`?ollama_url=` also works, for a non-default port. **It is honoured only for
loopback hosts** (`localhost`, `127.0.0.1`, `::1`) — accepting an arbitrary origin
would turn a shared link into a way to post someone else's code to a server of
the sender's choosing, which is not a trade worth making even in a prototype. A
rejected override falls back to the env var and does not enable the feature on
its own. Model names are likewise checked against `/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/`
before use.

Note that in an embedded editor these parameters come from the **host page** URL,
since that is the document the component is running in.

To run the demo:

```bash
ollama serve
ollama pull llama3.2:3b
# .env
REACT_APP_OLLAMA_URL='http://localhost:11434'
REACT_APP_OLLAMA_MODEL='llama3.2:3b'
yarn start   # then open http://localhost:3011/web-component.html
```

Ollama's default `OLLAMA_ORIGINS` allows `localhost:*`, so port 3011 is accepted
without extra configuration. If a browser blocks the request anyway, restart with
`OLLAMA_ORIGINS='*' ollama serve`.

## Relationship to `slm-evaluation`

The prompt is shared with the model evaluation harness in `slm-evaluation`, so
that behaviour seen in the editor can be read against a scored configuration
there. That repo is a **local-only checkout with no git remote** at the time of
writing — paths below are relative to it as a sibling of this one
(`../slm-evaluation`), because there is nothing to link to yet. `src/utils/aiHelp/prompts.js` copies `corpus/prompt.yml`'s `system_prompt`
(slug `pedagogical`, v1) and `corpus/guidelines.md` verbatim, and
`src/utils/aiHelp/ollamaClient.js` mirrors `lib/runner.rb#body_for` —
`temperature: 0.7`, `num_predict: 400`, and `think: false` (without which
reasoning models spend the whole token budget on `message.thinking` and return
empty content).

Four deliberate divergences, which mean output here is **not** a like-for-like
replay of a scored run:

1. **Streaming.** The harness uses `stream: false`. A 2-4B model can take several
   seconds, and a learner watching a spinner is a worse demo than text arriving
   as it is generated. The generated text itself is unaffected.
2. **The "already shown" block.** The harness's user turn is code + error +
   question. Ours appends what the learner has already read from the copydeck, so
   a short answer is not spent repeating copy they have just rejected as
   unhelpful.
3. **Level instructions.** The harness has one prompt config with no notion of
   levels. `LEVEL_INSTRUCTIONS` in `prompts.js` is the editor's own extension.
   The `solve` block is the only one that overrides `guidelines.md` — which says
   *"Do not write the corrected program for them"* — and it says so explicitly
   rather than leaving a small model to reconcile two contradictory
   instructions. These blocks are written to be liftable back into `corpus/` as
   additional `PromptConfig` rows.
4. **`NO_REPLY_POSSIBLE`.** `guidelines.md` assumes a conversation: it says to
   *"ask them to try it"*, offers `"Look at line 4 — what do you think `Score`
   refers to there?"` as a model answer, and suggests asking *"what were you
   expecting to happen?"* when unsure. In the harness that is fine — a reviewer
   reads the answer. In the panel the learner has no way to reply, so a question
   needing an answer just strands them. `NO_REPLY_POSSIBLE` overrides that part,
   and is appended **last**, after the level block. See below for why.

   **This is worth fixing upstream.** `guidelines.md` containing a worked example
   of the one pattern this UI cannot support is the single biggest source of
   unusable answers, and `slm-evaluation`'s `DEFERRED.md` already lists multi-turn
   as deferred — so the harness is arguably scoring a conversational style it does
   not itself offer.

## Making small models behave

Three things mattered far more than the wording of any single instruction, and
all were found by running real models rather than by reading output in tests.
Rates below are from `llama3.2:3b`, `gemma2:2b` and `phi4-mini` over 18 replies.

1. **Recency beats thoroughness.** A careful, itemised "do not ask questions"
   block placed after `guidelines.md` but before the level block was ignored
   about a third of the time. The same rule, cut to four lines and moved to the
   very end of the system prompt, plus a one-line reminder at the end of the
   *user* turn (`USER_TURN_REMINDER`), took that to roughly 1 in 18.
2. **Name the exemplar you are overriding.** Most of the surviving failures were
   the model reproducing `guidelines.md`'s own example sentence almost verbatim.
   Telling it explicitly that *that* example does not apply worked better than
   any amount of general prohibition.
3. **Enforce what matters; do not just ask.** The `hint` rung wrote the
   corrected line out anyway, which collapses the whole ladder — there is no
   reason to click "Show me the fix" if the fix is already on screen. So
   `withheldFix` in `formatAnswer.js` cuts the answer at the first code fence for
   every rung except `solve`. Prompting alone got code out of the reply most of
   the time; the filter makes it certain. A trailing lead-in ("Here's what you
   need to change:") is trimmed too, because a model that *obeys* still tends to
   announce the code it then does not write.

## Rendering

`formatAnswer.js` handles fenced code blocks and inline backticks and nothing
else — deliberately not a markdown parser. The models write markdown whether
asked to or not, and rendering the raw string left ` ```python ` visible and the
code unreadable, which matters most on the rung whose job is to show a fix.

Parsed blocks are returned as data and rendered as React elements, so untrusted
model output never becomes markup. An unterminated fence is treated as an open
code block, which is the normal state part-way through a streamed answer — it
renders the same way, so the code does not reflow when the closing fence lands.

Prose is split into paragraphs on blank lines, and the model's own hard wraps
**inside** a paragraph are collapsed to spaces. They were chosen for an
80-column terminal, not for a narrow panel, and rendering the answer as one
block with `white-space: pre-wrap` made it read as preformatted output. Line
breaks are still preserved inside code blocks, where they mean something.

`.ai-error-help` also sets `font-family` explicitly rather than inheriting it.
The card sits between the monospace traceback and the monospace console output,
and it is prose — it should not depend on what an ancestor happens to set in a
component whose styling hosts can override.

`rpf-markdown-core` is already a dependency and would be the right tool for real
markdown, but it cannot cope with the half-written syntax a stream produces.

## Icons

The buttons use SVGs from `src/assets/icons/`, **not** Material Symbols names.
The design system `Button` accepts a name string and renders it into a
`.material-symbols-sharp` span, but the icon font is only registered at document
level by the host: `design-system-react.css` has an `@import` for it that Vite
strips when the CSS is inlined as a string, and `@font-face` inside a shadow root
does not register a font anyway. `editor-standalone` does `import "material-symbols"`
at app level, which is why host-supplied *sidebar plugin* icons work there.

editor-ui should not depend on the host loading a font for its own built-in UI,
so `sparkle.svg` was added alongside the existing `info.svg`. It is hand-drawn on
the 24x24 Material grid and **has not been through design review** — flag it.

## Alternatives considered

| Option | Outcome |
|---|---|
| **Pre-written rungs first, then the model** | **Chosen.** Puts human-reviewed copy ahead of anything generated, costs nothing, and reserves the model for where there is a genuine gap. |
| Straight to the model on the first click | Rejected: puts unreviewed output in front of copy we already own and have had reviewed. |
| Model for all four levels, ignoring the copydeck | Rejected: discards human-reviewed, already-translated copy. |
| Mirror the harness prompt exactly, no levels | Rejected: `guidelines.md` forbids a Solve rung, so the ladder could not be built. |
| Non-streaming, to match the harness byte-for-byte | Rejected for the demo; see divergence 1. |
| Web component attributes for the URL and model | Rejected: too early to put in the host API. |
| Host-owned UI via the sidebar plugin API | Not chosen, but this is the route if it ever needs to be host-owned rather than built in. See [Sidebar plugins](host-integration/SidebarPlugins.md); that API also passes icons as Material Symbols name strings, which is the precedent used here. |

## Known issue: errors raised inside a library

**Not fixed.** When the exception comes from library code rather than the
learner's, the file and line the model is given are the library's, and it passes
them straight on. Observed with `phi4-mini` on a Plotly `ValueError`:

> You should change 'lifeExpe' to 'lifeExp' **on line 1337 of `_core.py`**.

The learner's mistake really was `lifeExpe`, on line 6 of their own `main.py`.
`_core.py:1337` is inside Plotly. This affects every error raised from a
dependency — Plotly, Pandas, Matplotlib, `requests` — not just this one.

Two things go wrong, both in this repo rather than in the model:

1. `state.editor.error` is built by the runner from the traceback's innermost
   frame (`PyodideWorker.js#parsePythonError`, then `handleError` in
   `PyodideRunner.jsx`), so the string itself ends `on line 1337 of _core.py`.
   `buildUserTurn` passes it through verbatim, and the model repeats it.
2. `buildCodeBlock` orders files by `erroringFile`, which is `errorDetails.file`
   — `_core.py`. That matches no project component, so `orderByRelevance`
   silently falls back to declaration order and the "keep the erroring file
   whole, drop the others" budget rule stops doing anything useful on multi-file
   projects.

### The fix

`friendlyExplain` already takes `file` and `line` overrides for exactly this
situation — its README documents them for when "the trace reports an unhelpful
source location (eg. Pyodide runs code as `<exec>`)" — so the precedent exists,
and `buildFriendlyErrorPayload` is where they would be passed.

The full stack is available: `parsePythonError` in `src/PyodideWorker.js` already
collects **every** `File "...", line N` frame into `matches`, and then keeps only
`matches[matches.length - 1]` — the innermost, which for a library error is the
library's. `rawTraceback` (the whole traceback string) is also already handed to
`handleError`, so nothing new needs to be captured at the worker boundary.

Note that `trace.frames` on the `friendlyExplain` result is **not** a shortcut
here: `cpythonAdapter` sets it to `[]` unconditionally and never fills it in.

- In `parsePythonError`, pick the innermost frame whose basename matches a
  **project component** instead of the innermost frame outright, falling back to
  current behaviour when none does. The component list is not available in the
  worker, so either pass the filenames in with the run, or do the frame
  selection in `handleError`, which has `projectCode`.
- Feed that file and line to `buildUserTurn` as `erroringFile`. That fixes the
  ordering bug in `buildCodeBlock` on its own.
- Add a line to the user turn naming the learner's files, and saying that any
  frame outside them is library code whose line numbers are not theirs to change.
  Without this the model still has the misleading location in the error string it
  is quoting from, and will keep repeating it.
- If no frame belongs to the learner's code at all, say that explicitly rather
  than letting the model invent a location. `guidelines.md` already tells it to
  admit when it cannot see the code, and this is precisely that case.

Worth a test per point: a fixture traceback with library frames below the
learner's, asserting the prompt names `main.py` and not `_core.py`, and that
`buildCodeBlock` still puts the learner's erroring file first on a multi-file
project.

## Notes for anyone picking this up

- **The models are still wrong sometimes, and confidently.** Observed locally:
  "Try changing `art = render_orb(...)` to `art = render_orb(...)`" (identical
  strings); "this code defines a function `foo` with an empty body" about
  `print(foo())`; and an explanation that `main.py` "is likely the name of a
  file, not a line of code". The ladder working mechanically is not the ladder
  working pedagogically — that is what the evaluation harness is for.
- **Roughly 1 reply in 18 still asks the learner a question they cannot
  answer.** Down from about 1 in 3, but not zero, and it cannot be driven to zero
  by prompting alone at this model size. `gemma2:2b` was the worst offender in
  local runs. A deterministic filter for trailing questions is the obvious next
  step if it proves annoying in use.
- **`smollm2:360m` is not usable here**, which matches its own note in
  `slm-evaluation/db/models.yml` ("the floor, weak at code"). It produced
  syntactically invalid Python and an explanation that contradicted itself. The
  code-withholding filter happens to shield the learner from the worst of it on
  the earlier rungs, but the `solve` rung would hand it over as-is.
- **Answers are capped at 400 tokens** to match the harness. When a model runs
  out of budget the UI says the answer stopped early, rather than leaving a
  sentence cut off mid-word looking like a bug.
- **`FriendlyErrorMessage.scss` hardcodes `var(--rpf-white)`** and has no `.--dark`
  block, so the friendly summary does not theme. `AiErrorHelp.scss` uses the
  editor's semantic tokens (`--editor-color-layer-2`, `--editor-color-outline`,
  `--editor-color-text`) instead. Fixing the older file the same way is a small
  separate change.
- **The design system `Button` defaults `aria-label` to `""`**, which blanks the
  accessible name of any button that does not pass one. `AiErrorHelp` passes it
  explicitly. This affects every `DesignSystemButton` in the codebase and is
  worth raising upstream.
