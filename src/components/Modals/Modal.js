import React from "react";
import Modal from 'react-modal';
import Button from "../Button/Button";
import { CloseIcon } from "../../Icons";

const EditorModal = ({contentLabel, isOpen, closeModal, heading, content, closeButton, buttons, links }) => {


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      className='modal-content'
      overlayClassName='modal-overlay'
      contentLabel={contentLabel}
      parentSelector={() => document.querySelector('#app')}
      appElement={document.getElementById('app') || undefined}
    >
      <div className='modal-content__header'>
        <h2 className='modal-content__heading'>{heading}</h2>
        {closeButton ? 
          <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
          : null
        }
      </div>

      {content}

      <div className='modal-content__buttons' >
        {buttons}
      </div>
      <div className='modal-content__links'>
        {links}
      </div>
      
    </Modal>
  )
}

export default EditorModal
