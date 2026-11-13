import { useTranslation } from "react-i18next";

// TODO: replace with real URLs once available
export const AI_HINT_LEARN_MORE_URL =
  "https://help.editor.raspberrypi.org/hc/en-us";
export const AI_HINT_FEEDBACK_URL =
  "https://form.raspberrypi.org/f/code-editor-feedback";

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
