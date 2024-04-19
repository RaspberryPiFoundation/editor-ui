import { Trans } from "react-i18next";

const TextWithBoldSpan = ({ i18nKey }) => {
  return (
    <Trans
      i18nKey={i18nKey}
      components={[<span className="school-onboarding__text--bold" />]}
    />
  );
};

export default TextWithBoldSpan;
