import React from "react";
import { connect } from "react-redux";
import { CallbackComponent } from "redux-oidc";
import { useNavigate } from "react-router-dom";
import userManager from "../utils/userManager";

const Callback = () => {
  let navigate = useNavigate();

  const previousRoute = localStorage.getItem("location");

  const onSuccess = () => {
    localStorage.removeItem("location");
    window.plausible("Login successful");
    navigate(previousRoute);
  };

  const onError = (error) => {
    navigate(previousRoute);
    console.error(error);
  };

  return (
    <CallbackComponent
      userManager={userManager}
      successCallback={onSuccess}
      errorCallback={(error) => onError(error)}
    >
      <div>Redirecting...</div>
    </CallbackComponent>
  );
};

export default connect()(Callback);
