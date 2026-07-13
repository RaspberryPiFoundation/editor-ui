import { useEffect, useEffectEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isEligibleForAutoSave } from "../../utils/autoSaveLogic";
import { createAutoSaveLifecycle } from "../../utils/autoSaveLifecycle";
import { useAutoSaveDebounce } from "./useAutoSaveDebounce";
import { useAutoSaveNavigationFlush } from "./useAutoSaveNavigationFlush";
import { useAutoSaveRunDeferral } from "./useAutoSaveRunDeferral";

/**
 * Python/HTML API autosave (not Scratch — see useScratchSaveState).
 *
 * Active when enabled is true (from useProjectPersistence as canAutoSave): logged-in
 * author with a saved project. When false, useLocalProjectBackup handles edits instead.
 *
 * Pipeline: project change → debounce → requestAutoSave → queue / cooldown / in-flight → API save
 *
 * This hook owns:
 * - Debounce (2s, or 10s for large projects) — useAutoSaveDebounce
 *   - Wait after each edit before trying to save, so rapid keystrokes produce one save
 *   - Use a longer wait for large projects (1MB+) because saves are slower and more expensive
 * - Cooldown (10s after a successful API save) — autoSaveLifecycle (below)
 *   - After a successful autosave, hold off further API saves for 10s to reduce save churn and noisy analytics
 *   - The clock starts on success, not when the save is requested — failed saves do not trigger cooldown
 * - Queue (edits while blocked, in-flight, or in cooldown) — autoSaveLifecycle (below)
 *   - Remember that a save is needed when we cannot run one yet, then retry when the blocker clears
 *   - Blocked while a Python run is active, an autosave is in flight, or Redux reports saving as pending
 *   - Also queues during cooldown; when allowed, saves once with the latest edits
 * - Python run deferral — useAutoSaveRunDeferral + autoSaveLifecycle
 *   - Do not snapshot file content mid-run while the runner may be writing files
 *   - When the run finishes, retry any queued autosave
 * - Navigation flush (pagehide / host API) — useAutoSaveNavigationFlush / autoSaveLifecycle
 *   - Persist unsaved changes before the user leaves, even during cooldown
 *   - Warn the user on beforeunload when there are dirty changes that autosave would normally handle
 *
 * Timing constants: autoSaveScheduling. Save-cycle logic: autoSaveLifecycle.
 */
export const useAutoSave = ({
  user,
  project,
  reactAppApiEndpoint,
  justLoaded = false,
  enabled: enabledProp,
}) => {
  const dispatch = useDispatch();
  const saving = useSelector((state) => state.editor.saving);
  const codeRunInProgress = useSelector(
    (state) => state.editor.codeRunInProgress,
  );
  const initialComponents = useSelector(
    (state) => state.editor.initialComponents,
  );
  const initialProjectName = useSelector(
    (state) => state.editor.initialProjectName,
  );
  const initialProjectInstructions = useSelector(
    (state) => state.editor.initialProjectInstructions,
  );

  const enabled = enabledProp ?? isEligibleForAutoSave(user, project);

  // --- Context (read by queue, cooldown, and in-flight logic in autoSaveLifecycle) ---
  const contextRef = useRef(null);
  contextRef.current = {
    enabled, // from useProjectPersistence — API autosave path active
    saving, // queue: blocks while Redux save is "pending"
    codeRunInProgress, // queue: blocks during Python run
    project, // current project payload sent to the API
    user, // logged-in author (access token for syncProject)
    initialComponents, // dirty check before save / queue drain
    initialProjectName,
    initialProjectInstructions,
    reactAppApiEndpoint,
    justLoaded, // skip expireJustLoaded until debounce fires after load
  };

  // --- Queue + in-flight refs (rules in autoSaveLifecycle) ---
  const schedulerRef = useRef({
    queued: false, // queue: set when blocked or in cooldown
    inFlight: false, // in-flight: blocks new saves; pairs with queue
    lastCompletedAt: null, // cooldown: timestamp for 10s window (see below)
  });
  const inFlightSavePromiseRef = useRef(null); // in-flight: await before flush
  const pendingSaveWaitersRef = useRef([]); // queue: wait for Redux save to finish

  // --- Cooldown refs (rules in autoSaveLifecycle) ---
  const cooldownTimerRef = useRef(null); // retry flushQueuedSave when cooldown elapses

  // --- Lifecycle (queue + cooldown + in-flight) ---
  const lifecycleRef = useRef(null);
  if (!lifecycleRef.current) {
    lifecycleRef.current = createAutoSaveLifecycle({
      dispatch,
      getContext: () => contextRef.current,
      getScheduler: () => schedulerRef.current,
      inFlightSavePromiseRef,
      pendingSaveWaitersRef,
      cooldownTimerRef,
    });
  }

  const lifecycle = lifecycleRef.current;

  // --- Lifecycle callbacks ---
  // Queue: requestAutoSave (may enqueue), flushQueuedSave (drain queue)
  // Cooldown: requestAutoSave (enqueue + schedule), flushPendingAutoSave (bypass), hasPendingAutoSave
  const requestAutoSave = useEffectEvent(() => lifecycle.requestAutoSave());
  const flushQueuedSave = useEffectEvent(() => lifecycle.flushQueuedSave());
  const flushPendingAutoSave = useEffectEvent(() =>
    lifecycle.flushPendingAutoSave(),
  );
  const hasPendingAutoSave = useEffectEvent(() =>
    lifecycle.hasPendingAutoSave(),
  );
  const shouldFlushBeforeNavigation = useEffectEvent(() =>
    lifecycle.shouldFlushBeforeNavigation(),
  );

  // Unblocks flushPendingAutoSave when Redux save leaves "pending"
  useEffect(() => {
    if (saving !== "pending") {
      lifecycle.resolveSaveWaiters();
    }
  }, [lifecycle, saving]);

  useAutoSaveDebounce({
    enabled,
    dispatch,
    contextRef,
    requestAutoSave,
  });
  useAutoSaveRunDeferral({ enabled, codeRunInProgress, flushQueuedSave });
  useAutoSaveNavigationFlush({
    enabled,
    lifecycle,
    hasPendingAutoSave,
    flushPendingAutoSave,
    shouldFlushBeforeNavigation,
  });

  return {
    requestAutoSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
  };
};
