import { useTranslation } from "react-i18next";

export const AI_HINT_LEARN_MORE_URL =
  "https://help.editor.raspberrypi.org/hc/en-us/articles/55620760636564-How-Artificial-Intelligence-AI-hints-work-in-the-Code-Editor";
export const AI_HINT_FEEDBACK_URL =
  "https://form.raspberrypi.org/f/ai-powered-error-messages-feedback";

const NewTabLink = ({ href, children }) => {
  const { t } = useTranslation();

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {children}
      {/* Hidden text that warns screen reader users the link opens a new tab */}
      <span className="rpf-visually-hidden">
        {` ${t("common.opensInNewTab")}`}
      </span>
    </a>
  );
};

// Keys match the named tags in the translation strings
export const aiHintLinkComponents = {
  learnMore: <NewTabLink href={AI_HINT_LEARN_MORE_URL} />,
  feedback: <NewTabLink href={AI_HINT_FEEDBACK_URL} />,
};
