import React from "react";
import { connect } from "react-redux";
import { CallbackComponent } from "redux-oidc";
import { useHistory } from 'react-router-dom'
import userManager from "../utils/userManager";

const Callback = () => {
  let history = useHistory()

  const onSuccess = () => {
    history.goBack()
  }

  const onError = (error) => {
    history.push("/");
    console.error(error);
  }

  return (
    <CallbackComponent userManager={userManager} successCallback={onSuccess} errorCallback={(error) => onError(error)}>
      <div>Redirecting...</div>
    </CallbackComponent>
  );
}

export default connect()(Callback);
