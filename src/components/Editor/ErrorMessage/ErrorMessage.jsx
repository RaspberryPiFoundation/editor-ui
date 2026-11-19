import "../../../assets/stylesheets/ErrorMessage.scss?inline";
import { useSelector } from "react-redux";
import DOMPurify from "dompurify";
import { useTranslation } from "react-i18next";
import CancelFillIcon from "../../../assets/icons/cancel_FILL.svg";
import ChevronDownIcon from "../../../assets/icons/chevron_down.svg";
import FriendlyErrorMessage from "../FriendlyErrorMessage/FriendlyErrorMessage";
import AiErrorMessage from "../AiErrorMessage/AiErrorMessage";
import useAiHintOffered from "../../../hooks/useAiHintOffered";

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);
  const { t } = useTranslation();
  const aiHintOffered = useAiHintOffered();

  return error ? (
    <div className="error-message">
      <details open="true">
        <summary className="error-message__summary">
          <span className="error-message__title">
            <CancelFillIcon />
            {t("output.errorMessage.title")}
          </span>
          <ChevronDownIcon className="error-message__chevron" />
        </summary>
        <div className="error-message__content">
          <div className="error-message__python">
            <pre
              className="error-message__error"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(error) }}
            />
          </div>
          <FriendlyErrorMessage />
          {aiHintOffered && <AiErrorMessage />}
        </div>
      </details>
    </div>
  ) : null;
};

export default ErrorMessage;
