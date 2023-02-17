import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SplitViewIcon, TabbedViewIcon } from "../../../../Icons";
import Button from "../../../Button/Button";
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
      <Button className = {`btn--small output-view-toggle__button output-view-toggle__button--tabbed${isSplitView ? "" : " output-view-toggle__button--active"}` }
        buttonOuter
        disabled = {codeRunTriggered || drawTriggered}
        label='Tabbed view'
        title='Tabbed view'
        ButtonIcon={TabbedViewIcon}
        onClickHandler={switchToTabbedView}
      />
      <Button className = {`btn--small output-view-toggle__button output-view-toggle__button--split${isSplitView ? " output-view-toggle__button--active" : ""}` }
        buttonOuter
        disabled = {codeRunTriggered || drawTriggered}
        label='Split view'
        title='Split view'
        ButtonIcon={SplitViewIcon}
        onClickHandler={switchToSplitView}
      />
    </div>
  )
}

export default OutputViewToggle
