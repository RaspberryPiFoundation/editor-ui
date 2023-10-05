import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { SplitViewIcon, TabbedViewIcon } from "../../../../Icons";
import Button from "../../../Button/Button";
import { setIsSplitView } from "../../../../redux/EditorSlice";
import { useMediaQuery } from "react-responsive";

import { useTranslation } from "react-i18next";

import "../../../../assets/stylesheets/OutputViewToggle.scss";
import { MOBILE_MEDIA_QUERY } from "../../../../utils/mediaQueryBreakpoints";

const OutputViewToggle = () => {
  const isSplitView = useSelector((state) => state.editor.isSplitView);
  const codeRunTriggered = useSelector(
    (state) => state.editor.codeRunTriggered,
  );
  const drawTriggered = useSelector((state) => state.editor.drawTriggered);
  const isMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });

  const dispatch = useDispatch();
  const { t } = useTranslation();

  const switchToTabbedView = () => {
    dispatch(setIsSplitView(false));
  };

  const switchToSplitView = () => {
    dispatch(setIsSplitView(true));
  };

  return (
    <div className="output-view-toggle">
      <Button
        className={"btn--tertiary output-view-toggle__button"}
        buttonText={
          isMobile
            ? null
            : isSplitView
            ? t("outputViewToggle.buttonTabLabel")
            : t("outputViewToggle.buttonSplitLabel")
        }
        disabled={codeRunTriggered || drawTriggered}
        label={
          isSplitView
            ? t("outputViewToggle.buttonTabLabel")
            : t("outputViewToggle.buttonSplitLabel")
        }
        title={
          isSplitView
            ? t("outputViewToggle.buttonTabTitle")
            : t("outputViewToggle.buttonSplitTitle")
        }
        ButtonIcon={isSplitView ? TabbedViewIcon : SplitViewIcon}
        buttonIconPosition="right"
        onClickHandler={isSplitView ? switchToTabbedView : switchToSplitView}
      />
    </div>
  );
};

export default OutputViewToggle;
