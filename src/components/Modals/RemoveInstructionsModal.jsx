import React from "react";
import { useTranslation } from "react-i18next";

import GeneralModal from "./GeneralModal";

const RemoveInstructionsModal = (props) => {
  const {
    buttons = null,
    isOpen = false,
    withCloseButton = false,
    setShowModal = null,
  } = props;

  const { t } = useTranslation();

  return (
    <GeneralModal
      heading={t("instructionsPanel.removeInstructionsModal.heading")}
      text={[
        {
          type: "paragraph",
          content: t(
            "instructionsPanel.removeInstructionsModal.removeInstuctionsWarning"
          ),
        },
      ]}
      buttons={buttons}
      isOpen={isOpen}
      closeModal={() => setShowModal(false)}
      withCloseButton={withCloseButton}
    >
      <ul>
        <p>
          {t(
            "instructionsPanel.removeInstructionsModal.resultRemovingInstructions"
          )}
        </p>
        <li>
          {t(
            "instructionsPanel.removeInstructionsModal.instructionsWillBeDeleted"
          )}
        </li>
        <li>
          {t(
            "instructionsPanel.removeInstructionsModal.studentsWorkingProjectNotRecievedInstructions"
          )}
        </li>
        <li>
          {t(
            "instructionsPanel.removeInstructionsModal.studentsStartedWillSeeInstructions"
          )}
        </li>
      </ul>
    </GeneralModal>
  );
};

export default RemoveInstructionsModal;
