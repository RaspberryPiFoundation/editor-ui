import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SplitViewIcon, TabbedViewIcon } from "../../../../Icons";
import Button from "../../../Button/Button";
import { setIsSplitView } from "../../EditorSlice";
import { useTranslation } from "react-i18next";

import './OutputViewToggle.scss';

const OutputViewToggle = () => {

  const isSplitView = useSelector((state) => state.editor.isSplitView)
  const codeRunTriggered = useSelector((state) => state.editor.codeRunTriggered)
  const drawTriggered = useSelector((state) => state.editor.drawTriggered)
  const dispatch = useDispatch()
  const { t } = useTranslation()

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
        label={t('outputViewToggle.buttonTabLabel')}
        title={t('outputViewToggle.buttonTabTitle')}
        ButtonIcon={TabbedViewIcon}
        onClickHandler={switchToTabbedView}
      />
      <Button className = {`btn--small output-view-toggle__button output-view-toggle__button--split${isSplitView ? " output-view-toggle__button--active" : ""}` }
        buttonOuter
        disabled = {codeRunTriggered || drawTriggered}
        label={t('outputViewToggle.buttonSplitLabel')}
        title={t('outputViewToggle.buttonSplitTitle')}
        ButtonIcon={SplitViewIcon}
        onClickHandler={switchToSplitView}
      />
    </div>
  )
}

export default OutputViewToggle
