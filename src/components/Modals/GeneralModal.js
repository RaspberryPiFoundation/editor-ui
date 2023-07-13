import React from "react";
import Modal from "react-modal";

import Button from "../Button/Button";
import "../../Modal.scss";
import { CloseIcon } from "../../Icons";
import { useTranslation } from "react-i18next";

const GeneralModal = ({
  buttons = [],
  children,
  defaultCallback,
  heading,
  isOpen,
  text = [],
  withCloseButton = false,
  closeModal,
}) => {
  const { t } = useTranslation();

  const onKeyDown = (e) => {
    if (e.key === "Enter" && defaultCallback) {
      e.preventDefault();
      defaultCallback();
    }
  };

  return (
    <div onKeyDown={onKeyDown}>
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel={heading}
        parentSelector={() => document.querySelector("#app")}
        appElement={document.getElementById("app") || undefined}
      >
        <div className="modal-content__header">
          <h2 className="modal-content__heading">{heading}</h2>
          {withCloseButton ? (
            <Button
              className="btn--tertiary"
              onClickHandler={closeModal}
              ButtonIcon={CloseIcon}
              label={t("modals.close")}
              title={t("modals.close")}
            />
          ) : null}
        </div>
        <div className="modal-content__body">
          {text.map((textItem, i) =>
            textItem.type === "subheading" ? (
              <h3 className="modal-content__subheading" key={i}>
                {textItem.content}
              </h3>
            ) : (
              <p className="modal-content__text" key={i}>
                {textItem.content}
              </p>
            ),
          )}
          {children}
        </div>
        <div className="modal-content__buttons">{buttons}</div>
      </Modal>
    </div>
  );
};

export default GeneralModal;
