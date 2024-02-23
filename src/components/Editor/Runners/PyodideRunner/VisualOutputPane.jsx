import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import AstroPiModel from "../../../AstroPiModel/AstroPiModel";
import Highcharts from "highcharts";

const VisualOutputPane = ({
  visuals,
  setVisuals,
  senseHatConfig,
  setSenseHatConfig,
}) => {
  const senseHatEnabled = useSelector((s) => s.editor.senseHatEnabled);
  const senseHatAlways = useSelector((s) => s.editor.senseHatAlwaysEnabled);
  const output = useRef();

  useEffect(() => {
    if (visuals.length === 0) {
      output.current.innerHTML = "";
    } else if (visuals.some((v) => !v.showing)) {
      setVisuals((visuals) => showVisuals(visuals, output, setSenseHatConfig));
    }
  }, [visuals, setVisuals]);

  return (
    <div className="visual-output">
      <div ref={output} className="pythonrunner-graphic" />
      {(senseHatEnabled || senseHatAlways) && (
        <AstroPiModel
          senseHatConfig={senseHatConfig}
          setSenseHatConfig={setSenseHatConfig}
        />
      )}
    </div>
  );
};

const showVisuals = (visuals, ...args) =>
  visuals.map((v) => (v.showing ? v : showVisual(v, ...args)));

const showVisual = (visual, output, setSenseHatConfig) => {
  switch (visual.origin) {
    case "sense_hat":
      setSenseHatConfig((config) => ({ ...config, ...visual.content }));
      break;
    case "pygal":
      Highcharts.chart(output.current, visual.content);
      break;
    case "turtle":
      output.current.innerHTML = elementFromProps(visual.content).outerHTML;
      break;
    default:
      throw new Error(`Unsupported origin: ${visual.origin}`);
  }

  visual.showing = true;
  return visual;
};

const elementFromProps = (map) => {
  const tag = map.get("tag");
  if (!tag) {
    return document.createTextNode(map.get("text"));
  }

  const node = document.createElement(tag);
  for (const [key, value] of map.get("props")) {
    node.setAttribute(key, value);
  }
  for (const childProps of map.get("children")) {
    node.appendChild(elementFromProps(childProps));
  }

  return node;
};

export default VisualOutputPane;
