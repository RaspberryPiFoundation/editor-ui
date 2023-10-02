import React, { useEffect } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Sk from "skulpt";
import AstroPiModel from "../../../AstroPiModel/AstroPiModel";
import { codeRunHandled, setError } from "../../EditorSlice";

const VisualOutputPane = () => {
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const senseHatAlwaysEnabled = useSelector(
    (state) => state.editor.senseHatAlwaysEnabled,
  );
  const senseHatEnabled = useSelector((state) => state.editor.senseHatEnabled);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const error = useSelector((state) => state.editor.error);

  const outputCanvas = useRef();
  const pygalOutput = useRef();
  const p5Output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (codeRunTriggered) {
      outputCanvas.current.innerHTML = "";
      pygalOutput.current.innerHTML = "";
      p5Output.current.innerHTML = "";

      Sk.py5 = {};
      Sk.py5.sketch = "p5Sketch";
      Sk.py5.assets = projectImages;

      Sk.p5 = {};
      Sk.p5.sketch = "p5Sketch";
      Sk.p5.assets = projectImages;

      (Sk.pygal || (Sk.pygal = {})).outputCanvas = pygalOutput.current;

      (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = "outputCanvas";
      Sk.TurtleGraphics.assets = Object.assign(
        {},
        ...projectImages.map((image) => ({
          [`${image.name}.${image.extension}`]: image.url,
        })),
      );
    }
  }, [codeRunTriggered, projectImages]);

  useEffect(() => {
    if (
      !drawTriggered &&
      p5Output.current &&
      p5Output.current.innerHTML !== ""
    ) {
      if (Sk.py5.stop) {
        Sk.py5.stop();
      } else {
        Sk.p5.stop();
      }

      if (error === "") {
        dispatch(setError(t("output.errors.interrupted")));
      }
      dispatch(codeRunHandled());
    }
  }, [drawTriggered, dispatch, t, error]);

  return (
    <div className="visual-output">
      <div id="p5Sketch" ref={p5Output} />
      <div id="pygalOutput" ref={pygalOutput} />
      <div className="pythonrunner-canvas-container">
        {senseHatEnabled || senseHatAlwaysEnabled ? (
          <AstroPiModel ref={outputCanvas} />
        ) : (
          <div
            id="outputCanvas"
            ref={outputCanvas}
            className="pythonrunner-graphic"
          />
        )}
      </div>
    </div>
  );
};

export default VisualOutputPane;
