import React, { useContext } from "react";
import "../../../assets/stylesheets/ErrorMessage.scss?inline";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { SettingsContext } from "../../../utils/settings";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";
import AiErrorMessage from "../AiErrorMessage/AiErrorMessage";
import { useCookies } from "react-cookie";
import useIsOnline from "../../../hooks/useIsOnline";
import useAiHintAvailable from "../../../hooks/useAiHintAvailable";
import {
  AI_HINTS_COOKIE,
  aiHintsTurnedOn,
} from "../../Menus/Sidebar/SettingsPanel/AiHintToggle/AiHintToggle";

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);
  const friendlyError = useSelector((state) => state.editor.friendlyError);
  const settings = useContext(SettingsContext);
  const isOnline = useIsOnline();
  const aiHintAvailable = useAiHintAvailable();
  const [cookies] = useCookies([AI_HINTS_COOKIE]);

  const showAiHint =
    aiHintAvailable &&
    aiHintsTurnedOn(cookies) &&
    isOnline &&
    friendlyError?.html;

  return error ? (
    <div className="error-message">
      <div
        className={`error-message__python error-message__python--${settings.fontSize}`}
      >
        <CancelFillIcon />
        <pre
          className="error-message__error"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(error) }}
        />
      </div>
      <FriendlyErrorMessage />
      {showAiHint && <AiErrorMessage />}
    </div>
  ) : null;
};

export default ErrorMessage;
