import './NewComponentButton.scss';

import {React} from 'react'
import { useDispatch } from 'react-redux';

import { showNewFileModal } from '../EditorSlice';
import Button from '../../Button/Button'
import { PlusIcon } from '../../../Icons';
import { useTranslation } from 'react-i18next';

const NewComponentButton = () => {
    const { t } = useTranslation()
    const dispatch = useDispatch();

    const openNewFileModal = () => {
      dispatch(showNewFileModal())
    }

    return (
        <Button
          buttonText={t('filePane.newFileButton')}
          ButtonIcon={PlusIcon}
          buttonOuter
          onClickHandler={openNewFileModal}
          className="btn--primary btn--small proj-new-component-button"
        />
    );
  }

export default NewComponentButton;
