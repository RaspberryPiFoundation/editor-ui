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
    <div
      className="sense-hat-model-view-controls"
      style={{
        boxSizing: "border-box",
        position: "absolute",
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        padding: "calc(0.5rem * var(--scale-factor, 1))",
      }}
    >
      <button
        aria-label={label}
        style={{
          backgroundColor: "white",
          zIndex: "1",
          width: "2rem",
          height: "2rem",
          borderRadius: "0.25rem",
          textAlign: "center",
          border: "1px solid white",
          fontFamily: "var(--editor-font-family-sans-serif)",
          fontWeight: 500,
        }}
        onClick={() => setIs3d((x) => !x)}
      >
        {target}
      </button>
    </div>
  );
};

export default ViewModeControls;
