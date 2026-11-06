import "../../../assets/stylesheets/AstroPiModel.scss?inline";
import ResetIcon from "../../../assets/icons/reset.svg";
import { useTranslation } from "react-i18next";

const OrientationResetButton = (props) => {
  const { resetOrientation } = props;

  const { t } = useTranslation();

  return (
    <button
      aria-label={t("output.senseHat.view.resetOrientation")}
      onClick={(e) => resetOrientation(e)}
    >
      <ResetIcon />
    </button>
  );
};

export default OrientationResetButton;
