import React from "react";
import { useTranslation } from "react-i18next";
import {
  Fieldset,
  RadioInput,
} from "@raspberrypifoundation/design-system-react";

import GeneralModal from "./GeneralModal";
import {
  REMOVE_ALL_STEPS,
  REMOVE_CURRENT_STEP,
} from "../../utils/instructionSteps";

const RemoveInstructionStepModal = (props) => {
  const {
    buttons = null,
    isOpen = false,
    setShowModal = null,
    showScopeOptions = false,
    removeScope = REMOVE_CURRENT_STEP,
    setRemoveScope = null,
  } = props;

  const { t } = useTranslation();

  return (
    <GeneralModal
      className="modal-content--remove-step"
      heading={t("instructionsPanel.removeStepModal.heading")}
      text={[
        {
          type: "paragraph",
          content: t("instructionsPanel.removeStepModal.warning"),
        },
        {
          type: "paragraph",
          content: t("instructionsPanel.removeStepModal.studentsWarning"),
        },
      ]}
      buttons={buttons}
      isOpen={isOpen}
      closeModal={() => setShowModal(false)}
    >
      {showScopeOptions && (
        <Fieldset
          legendText={t("instructionsPanel.removeStepModal.scopeLegend")}
          fullWidth
        >
          {[REMOVE_CURRENT_STEP, REMOVE_ALL_STEPS].map((scope) => (
            <RadioInput
              key={scope}
              id={`remove-step-scope-${scope}`}
              name="remove-step-scope"
              value={scope}
              label={t(`instructionsPanel.removeStepModal.scope.${scope}`)}
              checked={removeScope === scope}
              onChange={() => setRemoveScope(scope)}
              fullWidth
            />
          ))}
        </Fieldset>
      )}
    </GeneralModal>
  );
};

export default RemoveInstructionStepModal;
