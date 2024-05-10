import React from "react";
import "../../assets/stylesheets/ErrorMessage.scss";

const ErrorMessage = ({ error }) => {
  return error ? (
    <div className="error-message">
      <pre className="error-message__content">{error}</pre>
    </div>
  ) : null;
};

export default ErrorMessage;
