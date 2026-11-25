// Some checks are easier to make inside a custom action than as a temporal
// formula. For example, the action writes a program, presses Run and waits
// for the expected output, with no random actions happening in between. When
// such a check fails, the action calls `recordFailure(window, name, detail)`.
// `oracleProperty(name)` turns those records into a Bombadil property, so the
// failure shows up in the run summary and in Bombadil Inspect.

import { always, type Formula } from "@antithesishq/bombadil";
import { extract } from "@antithesishq/bombadil/browser";

const failures = extract(
  (state) =>
    ((state.window as any).__bombadilFailures ?? {}) as Record<
      string,
      string[]
    >,
);

export function oracleProperty(name: string): Formula {
  return always(() => (failures.current[name] ?? []).length === 0);
}
