import React, { useEffect } from "react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Sk from "skulpt";
import AstroPiModel from "../../../AstroPiModel/AstroPiModel";
import {
  codeRunHandled,
  setError,
  setErrorLine,
  setErrorLineNumber,
} from "../../../../redux/EditorSlice";

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

  const turtleOutput = useRef();
  const pygalOutput = useRef();
  const p5Output = useRef();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (codeRunTriggered) {
      turtleOutput.current.innerHTML = "";
      pygalOutput.current.innerHTML = "";
      p5Output.current.innerHTML = "";

      if (!window.py5) {
        window.py5 = {};
      }
      window.py5.sketch = "p5Sketch";

      if (!window.p5) {
        window.p5 = {};
      }
      window.p5.sketch = "p5Sketch";
      window.assets = projectImages;

      (Sk.pygal || (Sk.pygal = {})).outputCanvas = pygalOutput.current;

      (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target =
        turtleOutput.current;
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
      if (window.p5?.stop) {
        window.p5.stop();
      } else if (window.py5?.stop) {
        window.py5.stop();
      }

      if (error === "") {
        dispatch(setError(t("output.errors.interrupted")));
        dispatch(setErrorLine(""));
        dispatch(setErrorLineNumber(null));
      }
      dispatch(codeRunHandled());
    }
  }, [drawTriggered, dispatch, t, error]);

  return (
    <div className="visual-output">
      <div id="p5Sketch" ref={p5Output} />
      <div id="pygalOutput" ref={pygalOutput} />
      <div className="pythonrunner-canvas-container">
        <div
          id="turtleOutput"
          ref={turtleOutput}
          className="pythonrunner-graphic"
        />
      </div>
      {senseHatEnabled || senseHatAlwaysEnabled ? <AstroPiModel /> : null}
    </div>
  );
};

export default VisualOutputPane;
