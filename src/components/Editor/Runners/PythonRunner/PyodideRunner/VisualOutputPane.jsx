import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import AstroPiModel from "../../../../AstroPiModel/AstroPiModel";
import Highcharts from "highcharts";

const VisualOutputPane = ({ visuals, setVisuals }) => {
  const senseHatEnabled = useSelector((s) => s.editor.senseHatEnabled);
  const senseHatAlways = useSelector((s) => s.editor.senseHatAlwaysEnabled);
  const output = useRef();

  useEffect(() => {
    if (visuals.length === 0) {
      output.current.innerHTML = "";
    } else if (visuals.some((v) => !v.showing)) {
      setVisuals((visuals) => showVisuals(visuals, output));
    }
  }, [visuals, setVisuals]);

  return (
    <div className="visual-output">
      <div ref={output} className="pythonrunner-graphic" />
      {senseHatEnabled || senseHatAlways ? <AstroPiModel /> : null}
    </div>
  );
};

const showVisuals = (visuals, output) =>
  visuals.map((v) => (v.showing ? v : showVisual(v, output)));

const showVisual = (visual, output) => {
  switch (visual.origin) {
    case "sense_hat":
      output.current.textContent = JSON.stringify(visual.content);
      break;
    case "pygal":
      const chartContent = {
        ...visual.content,
        chart: {
          ...visual.content.chart,
          events: {
            ...visual.content.chart.events,
            load: function () {
              this.renderTo.style.overflow = "visible";
            },
          },
        },
        tooltip: {
          ...visual.content.tooltip,
          formatter:
            visual.content.chart.type === "pie"
              ? function () {
                  return this.key + ": " + this.y;
                }
              : null,
        },
      };
      Highcharts.chart(output.current, chartContent);
      break;
    case "turtle":
      output.current.innerHTML = elementFromProps(visual.content).outerHTML;
      break;
    case "matplotlib":
      // convert visual.content from Uint8Array to jpg
      const img = document.createElement("img");
      img.style = "max-width: 100%; max-height: 100%;";
      img.src = `data:image/jpg;base64,${window.btoa(
        String.fromCharCode(...new Uint8Array(visual.content)),
      )}`;
      output.current.innerHTML = img.outerHTML;
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
