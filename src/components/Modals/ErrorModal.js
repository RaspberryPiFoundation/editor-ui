import React from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import Button from "../Button/Button";
import { closeErrorModal } from "../Editor/EditorSlice";
import "../../Modal.scss";

const ErrorModal = ({ errorType, additionalOnClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isModalOpen = useSelector((state) => state.editor.errorModalShowing);
  const closeModal = () => {
    dispatch(closeErrorModal());
    if (additionalOnClose) {
      additionalOnClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Rename File"
        parentSelector={() => document.querySelector("#app")}
        appElement={document.getElementById("app") || undefined}
      >
        <div className="modal-content__header">
          <h2 className="modal-content__heading">{t("modal.error.heading")}</h2>
        </div>

        {t(`modal.error.${errorType}.message`, { defaultValue: null }) && (
          <div className="modal-content__body">
            <p className="modal-content__text">
              {t(`modal.error.${errorType}.message`)}
            </p>
          </div>
        )}

        <div className="modal-content__buttons">
          <Button
            className="btn--primary"
            buttonText={t("modal.close")}
            onClickHandler={closeModal}
          />
        </div>
      </Modal>
    </>
  );
};

ErrorModal.propTypes = {
  errorType: PropTypes.string,
  closeModal: PropTypes.func,
};

export default ErrorModal;
