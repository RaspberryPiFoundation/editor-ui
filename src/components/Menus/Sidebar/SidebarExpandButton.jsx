import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useMediaQuery } from "react-responsive";

import DoubleArrowRight from "../../../assets/icons/double_arrow_right.svg";
import { Button } from "@raspberrypifoundation/design-system-react";

import { setSidebarOption } from "../../../redux/EditorSlice";
import { selectInstructionSteps } from "../../../redux/InstructionsSlice";
import { MOBILE_MEDIA_QUERY } from "../../../utils/mediaQueryBreakpoints";

// Sits alongside the project bar and reopens the project instructions panel
// while the sidebar is collapsed. The equivalent collapse control lives in the
// instructions panel header.
const SidebarExpandButton = ({ allowMobileView = true }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const selectedSidebarOption = useSelector(
    (state) => state.editor.selectedSidebarOption,
  );
  const instructionsEditable = useSelector(
    (state) => state.editor.instructionsEditable,
  );
  const instructionsSteps = useSelector(selectInstructionSteps);
  const viewportIsMobile = useMediaQuery({ query: MOBILE_MEDIA_QUERY });
  const isMobile = allowMobileView && viewportIsMobile;

  const hasInstructions = instructionsSteps && instructionsSteps.length > 0;
  const instructionsAvailable = instructionsEditable || hasInstructions;
  const isCollapsed = selectedSidebarOption === null;

  if (isMobile || !isCollapsed || !instructionsAvailable) {
    return null;
  }

  const expandPanel = () => {
    dispatch(setSidebarOption("instructions"));
    if (window.plausible) {
      window.plausible("Expand file pane");
    }
  };

  return (
    <div className="project-bar-row__expand">
      <Button
        className="sidebar__panel-collapse"
        icon={"keyboard_double_arrow_right"}
        iconOnly
        text={t("sidebar.expandInstructions")}
        onClick={expandPanel}
        size="small"
        type="tertiary"
      />
    </div>
  );
};

SidebarExpandButton.propTypes = {
  allowMobileView: PropTypes.bool,
};

export default SidebarExpandButton;
