import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import PropTypes from "prop-types";

import WebComponentLoader from "../../containers/WebComponentLoader";
import store from "../../redux/stores/WebComponentStore";
import { resetStore } from "../../redux/RootSlice";
import { resetCodeRunEventTracking } from "../WebComponentProject/runEventTrackingState";
import dedupeDesignSystemWarnings from "../../utils/dedupeDesignSystemWarnings";
import loadInitialUserFromAuthKey from "../../utils/loadInitialUserFromAuthKey";
import "../../utils/i18n";

dedupeDesignSystemWarnings();

const Editor = ({
  className,
  "data-testid": dataTestId,
  useEditorStyles = true,
  authKey,
  ...loaderProps
}) => {
  loadInitialUserFromAuthKey(authKey);

  useEffect(
    () => () => {
      resetCodeRunEventTracking();
      store.dispatch(resetStore());
    },
    [],
  );

  return (
    <div
      id="editor-react-root"
      className={className}
      data-testid={dataTestId}
      data-editor-target="editor"
    >
      <Provider store={store}>
        <BrowserRouter>
          <WebComponentLoader
            authKey={authKey}
            useEditorStyles={useEditorStyles}
            {...loaderProps}
          />
        </BrowserRouter>
      </Provider>
    </div>
  );
};

Editor.propTypes = {
  authKey: PropTypes.string,
  className: PropTypes.string,
  "data-testid": PropTypes.string,
  useEditorStyles: PropTypes.bool,
};

export default Editor;
