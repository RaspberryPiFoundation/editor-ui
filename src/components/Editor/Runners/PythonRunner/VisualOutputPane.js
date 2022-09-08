import React, { useEffect } from "react";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sk from "skulpt"
import AstroPiModel from "../../../AstroPiModel/AstroPiModel";
import { codeRunHandled, setError, stopDraw } from "../../EditorSlice";

const VisualOutputPane = () => {

  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const drawTriggered = useSelector((state) => state.editor.drawTriggered)
  const senseHatAlwaysEnabled = useSelector((state) => state.editor.senseHatAlwaysEnabled);
  const senseHatEnabled = useSelector((state) => state.editor.senseHatEnabled);
  const projectImages = useSelector((state) => state.editor.project.image_list);
  const outputCanvas = useRef();
  const pygalOutput = useRef();
  const p5Output = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    if (codeRunTriggered) {
      outputCanvas.current.innerHTML = '';
      pygalOutput.current.innerHTML = '';
      p5Output.current.innerHTML = '';

      Sk.p5 = {}
      Sk.p5.sketch = "p5Sketch";
      Sk.p5.assets = projectImages;
    
      (Sk.pygal || (Sk.pygal = {})).outputCanvas = pygalOutput.current;
    
      (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'outputCanvas';
      Sk.TurtleGraphics.assets = Object.assign({}, ...projectImages.map((image) => ({[`${image.name}.${image.extension}`]: image.url})))
    
    }
  }, [codeRunTriggered])

  useEffect(() => {
    if (!drawTriggered && p5Output.current && p5Output.current.innerHTML !== '') {
      Sk.p5.stop();
      dispatch(setError('Execution interrupted'))
      dispatch(codeRunHandled())
    }

  }, [drawTriggered])

  return (
    <div className='visual-output'>
      <div id='p5Sketch' ref={p5Output} />
      <div id='pygalOutput' ref={pygalOutput} />
      <div className="pythonrunner-canvas-container">
        <div id='outputCanvas' ref={outputCanvas} className="pythonrunner-graphic" />
      </div>
      {senseHatEnabled || senseHatAlwaysEnabled ?<AstroPiModel/>:null}
    </div>
  )
}

export default VisualOutputPane
