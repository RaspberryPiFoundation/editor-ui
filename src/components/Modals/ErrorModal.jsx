import React from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";

import { Button } from "@raspberrypifoundation/design-system-react";
import { closeErrorModal, setError } from "../../redux/EditorSlice";
import "../../assets/stylesheets/Modal.scss";

const ErrorModal = ({ errorType, additionalOnClose }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const error = useSelector((state) => state.editor.error);

  const isModalOpen = useSelector((state) => state.editor.errorModalShowing);
  const closeModal = () => {
    dispatch(closeErrorModal());
    if (additionalOnClose) {
      additionalOnClose();
    }
    dispatch(setError(null));
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel={t("modal.error.error")}
        parentSelector={() =>
          document.querySelector("#app") ||
          document.querySelector("editor-wc").shadowRoot.querySelector("#wc")
        }
        appElement={
          document.querySelector("editor-wc") ||
          document.getElementById("app") ||
          undefined
        }
      >
        <div className="modal-content__header">
          <h2 className="modal-content__heading">{t("modal.error.heading")}</h2>
        </div>

        {t(`modal.error.${errorType || error}.message`, {
          defaultValue: null,
        }) && (
          <div className="modal-content__body">
            <p className="modal-content__text">
              {t(`modal.error.${errorType || error}.message`)}
            </p>
          </div>
        )}

        <div className="modal-content__buttons">
          <Button
            type="tertiary"
            text={t("modal.close")}
            onClick={closeModal}
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
