import React from "react";

import GeneralModal from "./GeneralModal";
import MultiStepForm from "../MultistepForm/MultistepForm";

const MultiStepModal = ({
  storageKey,
  steps,
  checkValidation = () => true,
  onSubmit = () => {},
  heading,
  isOpen,
  closeModal,
  withCloseButton = true,
  showProgress = false,
  storeCurrentStep = false,
}) => {
  return (
    <GeneralModal
      isOpen={isOpen}
      closeModal={closeModal}
      heading={heading}
      withCloseButton={withCloseButton}
    >
      <MultiStepForm
        storageKey={storageKey}
        steps={steps}
        checkValidation={checkValidation}
        onSubmit={onSubmit}
        showProgress={showProgress}
        storeCurrentStep={storeCurrentStep}
      />
    </GeneralModal>
  );
};

export default MultiStepModal;
