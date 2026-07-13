import { useEffect, useEffectEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { expireJustLoaded } from "../redux/EditorSlice";
import {
  clearTimerRef,
  getAutosaveDebounceMs,
} from "../utils/autoSaveScheduling";
import {
  clearAutoSaveHostApi,
  registerAutoSaveHostApi,
} from "../utils/autoSaveHostApi";
import { isEligibleForAutoSave } from "../utils/autoSaveLogic";
import { createAutoSaveLifecycle } from "../utils/autoSaveLifecycle";

/**
 * Python/HTML API autosave (not Scratch — see useScratchSaveState).
 *
 * Active when enabled is true (from useProjectPersistence as canAutoSave): logged-in
 * author with a saved project. When false, useLocalProjectBackup handles edits instead.
 *
 * Pipeline: project change → debounce → requestAutoSave → queue / cooldown / in-flight → API save
 *
 * This hook owns:
 * - Debounce (2s, or 10s for large projects) — this hook via getAutosaveDebounceMs
 *   - Timer runs in this hook; waits after each edit before requestAutoSave
 *   - 2s normally; 10s when combined file content exceeds 1MB (slower saves, less churn)
 *   - getAutosaveDebounceMs(project) in autoSaveScheduling picks the delay (plain function)
 * - Cooldown (10s after a successful API save) — autoSaveLifecycle
 *   - Starts when a save completes successfully, not when it is requested
 *   - Further edits queue until cooldown ends or navigation forces a flush
 * - Queue (edits while blocked, in-flight, or in cooldown) — autoSaveLifecycle
 *   - Blocked: Python run in progress, autosave in flight, or Redux save pending
 *   - Queued work drains when the blocker clears or cooldown elapses
 * - Python run deferral (flush queue when run ends) — this hook + autoSaveLifecycle
 *   - While code runs, autosave does not snapshot mid-run file writes
 *   - When codeRunInProgress goes false, flushQueuedSave retries any queued save
 * - Navigation flush (pagehide / host API; bypasses cooldown) — autoSaveLifecycle
 *   - flushPendingAutoSave waits for in-flight work, then saves even during cooldown
 *   - beforeunload warns when there are unsaved changes eligible for autosave
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

  // Latest props/Redux snapshot for autoSaveLifecycle (updated every render).
  const contextRef = useRef(null);
  contextRef.current = {
    enabled, // from useProjectPersistence — API autosave path active
    saving, // Redux save state — blocks autosave while "pending"
    codeRunInProgress, // Python run in progress — defer autosave until complete
    project, // current project payload sent to the API
    user, // logged-in author (access token for syncProject)
    initialComponents, // snapshot at load — detect dirty state
    initialProjectName,
    initialProjectInstructions,
    reactAppApiEndpoint,
    justLoaded, // skip expireJustLoaded until debounce fires after load
  };

  // Mutable save-cycle state — autoSaveLifecycle reads/writes these across async work.
  const schedulerRef = useRef({
    queued: false, // edits arrived while blocked or in cooldown
    inFlight: false, // autosave API call in progress
    lastCompletedAt: null, // timestamp for cooldown window
  });
  const inFlightSavePromiseRef = useRef(null); // await in-flight save before flush
  const pendingSaveWaitersRef = useRef([]); // resolvers waiting for Redux save to finish
  const cooldownTimerRef = useRef(null); // scheduled flush after cooldown elapses
  const debounceTimerRef = useRef(null); // edit debounce before requestAutoSave
  const prevCodeRunInProgressRef = useRef(codeRunInProgress); // detect run end edge

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
  const editDebounceMs = getAutosaveDebounceMs(project);

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

  // Resume flush waiters when a Redux save (manual or autosave) leaves pending.
  useEffect(() => {
    if (saving !== "pending") {
      lifecycle.resolveSaveWaiters();
    }
  }, [lifecycle, saving]);

  // Register host API and page lifecycle handlers when autosave is enabled.
  useEffect(() => {
    if (!enabled) {
      return;
    }

    registerAutoSaveHostApi({
      hasPendingAutoSave,
      flushPendingAutoSave,
      shouldFlushBeforeNavigation,
    });

    const handlePageHide = () => {
      flushPendingAutoSave();
    };

    const handleBeforeUnload = (event) => {
      if (!shouldFlushBeforeNavigation()) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      lifecycle.clearCooldownTimer();
      flushPendingAutoSave();
      clearAutoSaveHostApi();
    };
    // Omit useEffectEvent handlers from deps — they stay stable and call lifecycle via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, lifecycle]);

  // Retry queued autosave when a Python code run finishes.
  useEffect(() => {
    const wasInProgress = prevCodeRunInProgressRef.current;
    prevCodeRunInProgressRef.current = codeRunInProgress;

    if (wasInProgress && !codeRunInProgress && enabled) {
      flushQueuedSave();
    }
    // Omit flushQueuedSave from deps — useEffectEvent; must not re-run on callback identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codeRunInProgress, enabled]);

  // Debounce edits, then attempt API autosave.
  useEffect(() => {
    clearTimerRef(debounceTimerRef);

    if (!enabled) {
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;

      if (contextRef.current.justLoaded) {
        dispatch(expireJustLoaded());
      }

      requestAutoSave();
    }, editDebounceMs);

    return () => clearTimerRef(debounceTimerRef);
    // Omit requestAutoSave (useEffectEvent) and justLoaded (read from contextRef when timer fires).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, editDebounceMs, enabled, project, user]);

  return {
    requestAutoSave,
    flushPendingAutoSave,
    hasPendingAutoSave,
    shouldFlushBeforeNavigation,
  };
};
