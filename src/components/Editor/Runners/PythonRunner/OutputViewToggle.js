import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SplitViewIcon, TabbedViewIcon } from "../../../../Icons";
import { setIsSplitView } from "../../EditorSlice";

import './OutputViewToggle.scss';

const OutputViewToggle = () => {

  const isSplitView = useSelector((state) => state.editor.isSplitView)
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const drawTriggered = useSelector((state) => state.editor.drawTriggered)
  const dispatch = useDispatch()

  const switchToTabbedView = () => {
    dispatch(setIsSplitView(false))
  }

  const switchToSplitView = () => {
    dispatch(setIsSplitView(true))
  }

  return (
    <div className = {`output-view-toggle`} disabled = {codeRunTriggered || drawTriggered}>
      <button className = {`output-view-toggle__button output-view-toggle__button--tabbed${isSplitView ? "" : " output-view-toggle__button--active"}` } disabled = {codeRunTriggered || drawTriggered} onClick={switchToTabbedView}>
        <TabbedViewIcon />
      </button>
      <button className = {`output-view-toggle__button output-view-toggle__button--split${isSplitView ? " output-view-toggle__button--active" : ""}`} disabled = {codeRunTriggered || drawTriggered} onClick={switchToSplitView}>
        <SplitViewIcon />
      </button>
    </div>
  )
}

export default OutputViewToggle
