import React from "react";
import { connect } from "react-redux";
import { CallbackComponent } from "redux-oidc";
import { useHistory } from 'react-router-dom'
import userManager from "../utils/userManager";

const Callback = () => {
  let history = useHistory()

  return (
    <CallbackComponent
      userManager={userManager}
    successCallback={() => {
      history.push("/")
    }}
      errorCallback={error => {
        history.push("/");
        console.error(error);
      }}
      >
      <div>Redirecting...</div>
    </CallbackComponent>
  );
}

export default connect()(Callback);
