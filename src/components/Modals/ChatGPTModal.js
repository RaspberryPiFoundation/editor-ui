import React from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../Icons";

import Button from "../Button/Button";
import { closeChatGPTModal } from "../Editor/EditorSlice";

import "../../Modal.scss";
import { gql, useQuery } from "@apollo/client";

export const ERROR_EXPLANATION_QUERY = gql`
  query ErrorExplanationQuery($error: String!, $code: String!) {
    errorExplanation(error: $error, code: $code) {
      message
    }
  }
`;

const ChatGPTModal = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const errorMessage = useSelector((state) => state.editor.error);
  const mainFileContent = useSelector((state) => {
    if (state.editor.project && state.editor.project.components) {
      return state.editor.project.components[0].content;
    }
    return null;
  });

  const { loading, error, data } = useQuery(ERROR_EXPLANATION_QUERY, {
    variables: { error: errorMessage, code: mainFileContent },
    skip: errorMessage === undefined || mainFileContent === undefined,
  });

  const isModalOpen = useSelector((state) => state.editor.chatGPTModalShowing);

  const closeModal = () => dispatch(closeChatGPTModal());

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal-content"
        overlayClassName="modal-overlay"
        contentLabel="Rename file"
        parentSelector={() => document.querySelector("#app")}
        appElement={document.getElementById("app") || undefined}
      >
        <div className="modal-content__header">
          <h2 className="modal-content__heading">
            {t("chatGptModal.heading")}
          </h2>
          <Button
            className="btn--tertiary"
            onClickHandler={closeModal}
            ButtonIcon={CloseIcon}
          />
        </div>

        {!loading && data ? (
          <div style={{ whiteSpace: "pre-wrap" }}>
            {data.errorExplanation.message}
          </div>
        ) : null}
        {loading ? (
          <div>
            <p>{t("chatGptModal.loading")}</p>
          </div>
        ) : null}
        {error ? <p>{t("chatGptModal.error")}</p> : null}

        <div className="modal-content__buttons">
          <Button
            className="btn--secondary"
            buttonText={t("filePane.renameFileModal.cancel")}
            onClickHandler={closeModal}
          />
        </div>
      </Modal>
    </>
  );
};

export default ChatGPTModal;
