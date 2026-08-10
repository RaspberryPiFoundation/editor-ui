import React from "react";
import { useTranslation } from "react-i18next";

import GeneralModal from "./GeneralModal";

const RemoveInstructionStepModal = (props) => {
  const { buttons = null, isOpen = false, setShowModal = null } = props;

  const { t } = useTranslation();

  return (
    <GeneralModal
      heading={t("instructionsPanel.removeStepModal.heading")}
      text={[
        {
          type: "paragraph",
          content: t("instructionsPanel.removeStepModal.warning"),
        },
      ]}
      buttons={buttons}
      isOpen={isOpen}
      closeModal={() => setShowModal(false)}
    />
  );
};

export default RemoveInstructionStepModal;
