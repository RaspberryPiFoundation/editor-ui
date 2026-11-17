import { useEffect, useLayoutEffect, useRef } from "react";
import { useDispatch, useSelector, useStore } from "react-redux";
import { useCookies } from "react-cookie";
import {
  loadUserSettings,
  saveUserSettings,
  setUserSettings,
} from "../redux/UserSettingsSlice";

const COOKIE_SETTINGS = {
  theme: ["light", "dark"],
  fontSize: ["small", "medium", "large"],
};
const COOKIE_NAMES = Object.keys(COOKIE_SETTINGS);
const LEGACY_COOKIE_PATHS = ["/projects", "/python"];

const shouldInclude = (name, includeTheme) => includeTheme || name !== "theme";

export const settingsFromCookies = (cookies, { includeTheme = true } = {}) =>
  Object.fromEntries(
    Object.entries(COOKIE_SETTINGS)
      .filter(([name]) => shouldInclude(name, includeTheme))
      .filter(([name, values]) => values.includes(cookies[name]))
      .map(([name]) => [name, cookies[name]]),
  );

export const writeSettingsCookies = (
  settings,
  { setCookie, removeCookie },
  { includeTheme = true } = {},
) => {
  COOKIE_NAMES.filter(
    (name) => name in settings && shouldInclude(name, includeTheme),
  ).forEach((name) => {
    LEGACY_COOKIE_PATHS.forEach((path) => removeCookie(name, { path }));
    if (settings[name] == null) {
      removeCookie(name, { path: "/" });
    } else {
      setCookie(name, settings[name], { path: "/" });
    }
  });
};

export const useLoadUserSettings = ({
  reactAppApiEndpoint,
  user,
  hostTheme,
}) => {
  const dispatch = useDispatch();
  const store = useStore();
  const [cookies, setCookie, removeCookie] = useCookies(COOKIE_NAMES);
  const includeTheme = !hostTheme;
  const userId = user?.profile?.user;

  const latest = useRef();
  latest.current = {
    cookies,
    setCookie,
    removeCookie,
    accessToken: user?.access_token,
  };

  // Layout effect so cookie settings apply before the first paint
  useLayoutEffect(() => {
    dispatch(
      setUserSettings(
        settingsFromCookies(latest.current.cookies, { includeTheme }),
      ),
    );
  }, [dispatch, includeTheme]);

  useEffect(() => {
    const { accessToken } = latest.current;
    if (!userId || !accessToken) return;

    const request = dispatch(
      loadUserSettings({ reactAppApiEndpoint, accessToken }),
    );
    request
      .unwrap()
      // Write what ended up in state, which keeps any changes made while loading
      .then(() =>
        writeSettingsCookies(store.getState().userSettings, latest.current, {
          includeTheme,
        }),
      )
      .catch(() => {
        // API unavailable or load cancelled, so keep the current settings
      });

    // Cancel the load if the user changes (e.g. switches account) or unmounts
    return () => request.abort();
  }, [dispatch, store, userId, reactAppApiEndpoint, includeTheme]);
};

export const useUpdateUserSettings = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const reactAppApiEndpoint = useSelector(
    (state) => state.editor.reactAppApiEndpoint,
  );
  const accessToken = useSelector((state) => state.auth?.user?.access_token);
  const [, setCookie, removeCookie] = useCookies(COOKIE_NAMES);

  return async (settings) => {
    const currentSettings = store.getState().userSettings;
    const previousSettings = Object.fromEntries(
      Object.keys(settings).map((key) => [key, currentSettings[key]]),
    );

    writeSettingsCookies(settings, { setCookie, removeCookie });
    const result = await dispatch(
      saveUserSettings({
        settings,
        previousSettings,
        reactAppApiEndpoint,
        accessToken,
      }),
    );

    // The save failed and state was rolled back, so update the cookies to match
    if (saveUserSettings.rejected.match(result)) {
      const restored = store.getState().userSettings;
      writeSettingsCookies(
        Object.fromEntries(
          Object.keys(settings).map((key) => [key, restored[key]]),
        ),
        { setCookie, removeCookie },
      );
    }
    return result;
  };
};
