import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import Button from "../Button/Button";
import '../../Modal.scss';
import { closeNotFoundModal, syncProject } from "../Editor/EditorSlice";
import { defaultPythonProject } from "../../utils/defaultProjects";
import GeneralModal from "./GeneralModal";

const NotFoundModal = () => {
  const dispatch = useDispatch()
  const { t } = useTranslation();
  const user = useSelector((state) => state.auth.user)
  
  const isModalOpen = useSelector((state) => state.editor.notFoundModalShowing)
  const closeModal = () => dispatch(closeNotFoundModal())

  const createNewProject = async () => {
    if (user) {
      dispatch(syncProject('save')({ project: defaultPythonProject, accessToken: user.access_token, autosave: false }))
    }
    closeModal()
  }

  return (
    <GeneralModal
      isOpen={isModalOpen}
      closeModal={closeModal}
      withCloseButton
      heading={t('project.notFoundModal.heading')}
      text={[
        {type: 'paragraph', content: t('project.notFoundModal.text')}
      ]}
      buttons={[
        <Button key='new' className='btn--primary' buttonText={t('project.notFoundModal.newProject')} onClickHandler={createNewProject} />,
        <a key='link' className='btn btn--secondary' href='https://projects.raspberrypi.org'>{t('project.notFoundModal.projectsSiteLinkText')}</a>
      ]}
      defaultCallback={createNewProject}
    />
  );
}

export default NotFoundModal;
