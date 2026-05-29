import React, { useEffect, useState } from "react";
import "../../../assets/stylesheets/FriendlyErrorMessage.scss";
import { getFriendlyErrorMessage } from "./friendlyErrorMessageApi.stub";

const FriendlyErrorMessage = () => {
  const [message, setMessage] = useState({ title: "", summary: "" });

  useEffect(() => {
    let isMounted = true;

    const loadFriendlyErrorMessage = async () => {
      const response = await getFriendlyErrorMessage();

      if (isMounted) {
        setMessage(response);
      }
    };

    loadFriendlyErrorMessage();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="friendly-error-message">
      <div className="friendly-error-message__title">{message.title}</div>
      <div className="friendly-error-message__summary">{message.summary}</div>
    </div>
  );
};

export default FriendlyErrorMessage;
