import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import AstroPiModel from "../../../AstroPiModel/AstroPiModel";
import Highcharts from "highcharts";

const VisualOutputPane = ({ visualOutput }) => {
  const senseHatAlwaysEnabled = useSelector((s) => s.editor.senseHatAlwaysEnabled);
  const senseHatEnabled = useSelector((s) => s.editor.senseHatEnabled);
  const projectImages = useSelector((s) => s.editor.project.image_list); // TODO: turtle
  const output = useRef();

  visualOutput.clear = () => {
    output.current.innerHTML = "";
  };

  visualOutput.handleVisual = (origin, content) => {
    if (origin === "sense_hat") { output.current.innerText = JSON.stringify(content); }
    if (origin === "pygal") { Highcharts.chart(output.current, content); }
    if (origin === "turtle") { output.current.innerHTML = elementFromProps(content).outerHTML; }
  };

  const elementFromProps = (map) => {
    const tag = map.get("tag");
    if (!tag) { return document.createTextNode(map.get("text")); }

    const node = document.createElement(map.get("tag"));

    for (const [key, value] of map.get("props")) { node.setAttribute(key, value); }
    for (const childProps of map.get("children")) { node.appendChild(elementFromProps(childProps)); }

    return node;
  }

  return (
    <div className="visual-output">
      <div ref={output} className="pythonrunner-graphic" />
      {senseHatEnabled || senseHatAlwaysEnabled ? <AstroPiModel /> : null}
    </div>
  );
};

export default VisualOutputPane;
