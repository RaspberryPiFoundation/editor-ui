import React, { useCallback, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import AstroPiModel from "../../../../AstroPiModel/AstroPiModel";
import Highcharts from "highcharts";
import Plotly from "plotly.js";

const VisualOutputPane = ({ visuals, setVisuals }) => {
  const senseHatEnabled = useSelector((s) => s.editor.senseHatEnabled);
  const senseHatAlways = useSelector((s) => s.editor.senseHatAlwaysEnabled);
  const output = useRef();

  const showVisual = useCallback((visual, output) => {
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
      case "plotly":
        const plotlyJson = visual.content;
        // Parse the JSON
        const figure = JSON.parse(plotlyJson);
        // Render using Plotly.js
        Plotly.newPlot(output.current, figure.data, figure.layout);
        break;
      default:
        throw new Error(`Unsupported origin: ${visual.origin}`);
    }

    visual.showing = true;
    return visual;
  }, []);

  const showVisuals = useCallback(
    (visuals, output) =>
      visuals.map((v) => (v.showing ? v : showVisual(v, output))),
    [showVisual],
  );

  useEffect(() => {
    if (visuals.length === 0) {
      output.current.innerHTML = "";
    } else if (visuals.some((v) => !v.showing)) {
      setVisuals((visuals) => showVisuals(visuals, output));
    }
  }, [visuals, setVisuals, showVisuals]);

  return (
    <div className="visual-output">
      <div ref={output} className="pythonrunner-graphic" />
      {senseHatEnabled || senseHatAlways ? <AstroPiModel /> : null}
    </div>
  );
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
