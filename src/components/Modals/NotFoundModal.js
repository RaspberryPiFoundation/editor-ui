import React from "react";
import Modal from 'react-modal';
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import '../../Modal.scss';
import { closeNotFoundModal } from "../Editor/EditorSlice";
import { CloseIcon } from "../../Icons";
import { createOrUpdateProject } from "../../utils/apiCallHandler";
import { useHistory } from "react-router-dom";
import { defaultPythonProject } from "../../utils/defaultProjects";

const NotFoundModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const history = useHistory()
  const user = useSelector((state) => state.auth.user)
  
  const isModalOpen = useSelector((state) => state.editor.notFoundModalShowing)
  const closeModal = () => dispatch(closeNotFoundModal())

  const createNewProject = async () => {
    closeModal()
    if (user) {
      const response = await createOrUpdateProject(defaultPythonProject, user.access_token);
      const identifier = response.data.identifier;
      const project_type = response.data.project_type;
      history.push(`/${project_type}/${identifier}`);
    }
  }

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className='modal-content'
        overlayClassName='modal-overlay'
        contentLabel={t('project.notFoundModal.heading')}
        parentSelector={() => document.querySelector('#app')}
        appElement={document.getElementById('app') || undefined}
      >
        <div className='modal-content__header'>
          <h2 className='modal-content__heading'>{t('project.notFoundModal.heading')}</h2>
          <button onClick={closeModal}>
            <CloseIcon/>
          </button>
        </div>
        <p className='modal-content__text'>{t('project.notFoundModal.text')}</p>

        <div className='modal-content__buttons' >
          <a className='btn btn--secondary' href='https://projects.raspberrypi.org'>{t('project.notFoundModal.projectsSiteLinkText')}</a>
          <Button className='btn--primary' buttonText={t('project.notFoundModal.newProject')} onClickHandler={createNewProject} />
        </div>
      </Modal>
    </>
  );
}

export default NotFoundModal;
