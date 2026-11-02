import { useTranslation } from "react-i18next";

/**
 * Used to toggle between 2D and 3D views of the SenseHAT.
 */
const ViewModeControls = ({ is3d, setIs3d }) => {
  const target = is3d ? "2D" : "3D";
  const { t } = useTranslation();
  const label = t(
    is3d
      ? "output.senseHat.view.toggleTo2D"
      : "output.senseHat.view.toggleTo3D",
  );

  return (
    <div className="sense-hat-model-view-controls">
      <button aria-label={label} onClick={() => setIs3d((x) => !x)}>
        {target}
      </button>
    </div>
  );
};

export default ViewModeControls;
