import { friendlyExplain } from "@raspberrypifoundation/python-friendly-error-messages";

/**
 * Build the redux payload for a friendly error.
 *
 * `friendlyExplain` is called twice on purpose. Its `sections` option filters
 * only the assembled `html` string, not the structured fields, and the library
 * returns the plain-text `why`/`steps` but not their token-highlighted HTML.
 * Two calls therefore give us two ready-made snippets - the summary shown
 * immediately, and the fuller explanation revealed on request - both styled by
 * the same `.pfem__*` rules. It is a pure function over an already-loaded
 * copydeck, so the second call costs nothing.
 *
 * Returns null when the error has no friendly explanation, so callers fall back
 * to the raw Python error.
 */
const buildFriendlyErrorPayload = (options) => {
  const summary = friendlyExplain({
    ...options,
    sections: ["title", "summary"],
  });

  if (!summary?.html) {
    return null;
  }

  // Concept 3 shows the pre-written `why` straight away, under the summary,
  // and leaves the steps out: the learner's own question to the model takes
  // their place.
  const detail = friendlyExplain({ ...options, sections: ["why"] });

  return {
    html: summary.html,
    // Pre-written and human-reviewed. Null when this copydeck variant has no
    // `why`.
    detailHtml: detail?.why ? detail.html : null,
    title: summary.title,
    summary: summary.summary,
    why: summary.why,
    steps: summary.steps,
    variantId: summary.variantId,
    trace: summary.trace,
  };
};

export default buildFriendlyErrorPayload;
