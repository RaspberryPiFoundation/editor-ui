import { useCookies } from "react-cookie";
import { useLocation } from "react-router-dom";
import { SettingsContext } from "./settings";

const SettingsProvider = ({ id, children }) => {
  const [cookies] = useCookies(["theme", "fontSize"]);
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";
  const location = useLocation();
  // Only use theming if the location pathname matches /{locale}/projects/{identifier}
  const useTheming = location.pathname.match(
    /\/[a-z]{2}\/projects\/[a-z0-9-]+/,
  );
  const theme = useTheming ? cookies.theme || themeDefault : "light";

  return (
    <div id={id} className={`--${theme}`}>
      <SettingsContext.Provider
        value={{
          theme,
          fontSize: cookies.fontSize || "small",
        }}
      >
        {children}
      </SettingsContext.Provider>
    </div>
  );
};

export default SettingsProvider;
