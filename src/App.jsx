import "./assets/stylesheets/App.scss";
import "./assets/stylesheets/rpf_design_system/typography.scss";
import "./assets/stylesheets/Notifications.scss";

import AppRoutes from "./components/AppRoutes";
import BetaBanner from "./components/BetaBanner/BetaBanner";
import BetaModal from "./components/Modals/BetaModal";
import { BrowserRouter } from "react-router-dom";
import GlobalNav from "./components/GlobalNav/GlobalNav";
import LoginToSaveModal from "./components/Modals/LoginToSaveModal";
import { RpfGlobalNav } from "@raspberrypifoundation/rpf-global-nav/dist/react";
import { SettingsContext } from "./utils/settings";
import ToastCloseButton from "./utils/ToastCloseButton";
import { ToastContainer } from "react-toastify";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { useState } from "react";

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(["theme", "fontSize"]);
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";

  const locales = {
    en: { text: "English" },
    fr: { text: "French" },
    es: { text: "Spanish" },
    de: { text: "German" },
    it: { text: "Italian" },
    pt: { text: "Portuguese" },
    ja: { text: "Japanese" },
    ko: { text: "Korean" },
    zh: { text: "Chinese" },
    ru: { text: "Russian" },
    ar: { text: "Arabic" },
    hi: { text: "Hindi" },
    nl: { text: "Dutch" },
    sv: { text: "Swedish" },
    pl: { text: "Polish" },
    fi: { text: "Finnish" },
    tr: { text: "Turkish" },
    cs: { text: "Czech" },
    da: { text: "Danish" },
    no: { text: "Norwegian" },
  };
  const [locale, setLocale] = useState("en");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLocaleSwitch = (newLocale) => {
    console.log(newLocale);
    setLocale(newLocale);
  };

  const handleOnLogInClicked = () => {
    console.log("Log In clicked");
    setLoggedIn(true);
  };

  const handleOnLogOutClicked = () => {
    console.log("Log Out clicked");
    setLoggedIn(false);
  };

  return (
    <div id="app" className={`--${cookies.theme || themeDefault}`}>
      <RpfGlobalNav
        locale={locale}
        locales={locales}
        loggedIn={loggedIn}
        onLogInClicked={handleOnLogInClicked}
        onLogOutClicked={handleOnLogOutClicked}
        onSelectLanguage={handleLocaleSwitch}
      />
      <SettingsContext.Provider
        value={{
          theme: cookies.theme || themeDefault,
          fontSize: cookies.fontSize || "small",
        }}
      >
        <ToastContainer
          enableMultiContainer
          containerId="top-center"
          position="top-center"
          className="toast--top-center"
          closeButton={ToastCloseButton}
        />
        <BrowserRouter basename={process.env.REACT_APP_BASE_URL}>
          {isEmbedded ? null : (
            <>
              <GlobalNav />
              <BetaBanner />
            </>
          )}
          <AppRoutes />
          <BetaModal />
          <LoginToSaveModal />
        </BrowserRouter>
        <ToastContainer
          enableMultiContainer
          containerId="bottom-center"
          position="bottom-center"
          className="toast--bottom-center"
        />
      </SettingsContext.Provider>
    </div>
  );
}

export default App;
