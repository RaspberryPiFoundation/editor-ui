import { Trans } from "react-i18next";
import { Link } from "react-router-dom";

const TextWithLink = ({ i18nKey, to }) => {
  return (
    <span>
      <Trans i18nKey={i18nKey} components={[<Link to={to} />]} />
    </span>
  );
};

export default TextWithLink;
