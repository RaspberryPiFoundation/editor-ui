import "./assets/stylesheets/App.scss";
import "./assets/stylesheets/rpf_design_system/typography.scss";
import "./assets/stylesheets/Notifications.scss";

import { useCookies } from "react-cookie";
import { BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import { SettingsContext } from "./utils/settings";
import AppRoutes from "./components/AppRoutes";
import GlobalNav from "./components/GlobalNav/GlobalNav";
import BetaBanner from "./components/BetaBanner/BetaBanner";
import BetaModal from "./components/Modals/BetaModal";
import LoginToSaveModal from "./components/Modals/LoginToSaveModal";
import ToastCloseButton from "./utils/ToastCloseButton";
import ollama from "ollama";

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);
  const [cookies] = useCookies(["theme", "fontSize"]);
  const themeDefault = window.matchMedia("(prefers-color-scheme:dark)").matches
    ? "dark"
    : "light";

  const response = ollama.chat({
    model: "llama3",
    messages: [
      {
        role: "user",
        content: "What is the meaning of life?",
      },
    ],
  });

  console.log(response.message.content);

  return (
    <div id="app" className={`--${cookies.theme || themeDefault}`}>
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
