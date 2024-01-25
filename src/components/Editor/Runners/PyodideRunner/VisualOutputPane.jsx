import React, { useRef } from "react";
import { useSelector } from "react-redux";
import AstroPiModel from "../../../AstroPiModel/AstroPiModel";
import Highcharts from "highcharts";

const VisualOutputPane = ({ visualOutput }) => {
  const senseHatAlwaysEnabled = useSelector(
    (s) => s.editor.senseHatAlwaysEnabled,
  );
  const senseHatEnabled = useSelector((s) => s.editor.senseHatEnabled);
  const projectImages = useSelector((s) => s.editor.project.image_list); // TODO: turtle
  const output = useRef();

  visualOutput.clear = () => {
    output.current.innerHTML = "";
  };

  visualOutput.handleVisual = (origin, content) => {
    switch (origin) {
      case "sense_hat":
        output.current.innerText = JSON.stringify(content);
        break;
      case "pygal":
        Highcharts.chart(output.current, content);
        break;
      case "turtle":
        output.current.innerHTML = elementFromProps(content).outerHTML;
        break;
      default:
        throw new Error(`Unsupported origin: ${origin}`);
    }
  };

  const elementFromProps = (map) => {
    const tag = map.get("tag");
    if (!tag) {
      return document.createTextNode(map.get("text"));
    }

    const node = document.createElement(map.get("tag"));

    for (const [key, value] of map.get("props")) {
      node.setAttribute(key, value);
    }
    for (const childProps of map.get("children")) {
      node.appendChild(elementFromProps(childProps));
    }

    return node;
  };

  return (
    <div className="visual-output">
      <div ref={output} className="pythonrunner-graphic" />
      {senseHatEnabled || senseHatAlwaysEnabled ? <AstroPiModel /> : null}
    </div>
  );
};

export default VisualOutputPane;
