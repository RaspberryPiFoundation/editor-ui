import React from "react";
import Modal from 'react-modal';

import Button from "../Button/Button";
import '../../Modal.scss';
import { CloseIcon } from "../../Icons";

const GeneralModal = ({buttons, children, contentLabel, heading, isOpen, text, withCloseButton = false, closeModal }) => {
  const buttonComponents = buttons.map((ButtonFromProps) => (
    () => ButtonFromProps
  ))

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
        { withCloseButton ? 
          <Button className='btn--tertiary' onClickHandler={closeModal} ButtonIcon = {CloseIcon} />
          : null
        }
      </div>
      <div className='modal-content__body'>
        {text.map((textItem, i) => (
          textItem.type === 'subheading' ?
            <h3 className='modal-content__subheading' key={i}>{textItem.content}</h3>
          :
            <p className='modal-content__text' key={i}>{textItem.content}</p>
        ))}
      </div>
      {children}
      <div className='modal-content__buttons' >
        {buttonComponents.map((ButtonComponent, i) => (
          <ButtonComponent key={i}/>
        ))}
      </div>
    </Modal>
  );
}

export default GeneralModal;
