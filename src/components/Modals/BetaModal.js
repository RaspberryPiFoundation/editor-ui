import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import { closeBetaModal } from "../Editor/EditorSlice";
import GeneralModal from "./GeneralModal";
import "../../Modal.scss";

const BetaModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isModalOpen = useSelector((state) => state.editor.betaModalShowing);
  const closeModal = () => dispatch(closeBetaModal());

  return (
    <GeneralModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      heading={t("betaBanner.modal.heading")}
      text={[
        { type: "subheading", content: t("betaBanner.modal.meaningHeading") },
        { type: "paragraph", content: t("betaBanner.modal.meaningText") },
        { type: "subheading", content: t("betaBanner.modal.whatNextHeading") },
        { type: "paragraph", content: t("betaBanner.modal.whatNextText") },
      ]}
      buttons={[
        <Button
          className="btn--primary"
          buttonText={t("betaBanner.modal.close")}
          onClickHandler={closeModal}
        />,
      ]}
      defaultCallback={closeModal}
    />
  );
};

export default BetaModal;
