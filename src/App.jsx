import React from "react";

import "./assets/stylesheets/App.scss";
import "./assets/stylesheets/rpf_design_system/typography.scss";
import "./assets/stylesheets/Notifications.scss";

import { BrowserRouter } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";

import AppRoutes from "./components/AppRoutes";
import GlobalNav from "./components/GlobalNav/GlobalNav";
import BetaBanner from "./components/BetaBanner/BetaBanner";
import BetaModal from "./components/Modals/BetaModal";
import LoginToSaveModal from "./components/Modals/LoginToSaveModal";
import ToastCloseButton from "./utils/ToastCloseButton";
import SettingsProvider from "./utils/SettingsProvider";

function App() {
  const isEmbedded = useSelector((state) => state.editor.isEmbedded);

  return (
    <BrowserRouter basename={process.env.REACT_APP_BASE_URL}>
      <SettingsProvider id="app">
        <ToastContainer
          enableMultiContainer
          containerId="top-center"
          position="top-center"
          className="toast--top-center"
          closeButton={ToastCloseButton}
        />
        {isEmbedded ? null : (
          <>
            <GlobalNav />
            <BetaBanner />
          </>
        )}
        <AppRoutes />
        <BetaModal />
        <LoginToSaveModal />
        <ToastContainer
          enableMultiContainer
          containerId="bottom-center"
          position="bottom-center"
          className="toast--bottom-center"
        />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;
