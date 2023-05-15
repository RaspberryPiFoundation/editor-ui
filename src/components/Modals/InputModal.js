import React, { useCallback } from "react";
import GeneralModal from "./GeneralModal";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";

const InputModal = ({inputLabel, inputDefaultValue, inputHelpText, ...otherProps}) => {

  const inputBox = useCallback((node) => {
    if (node) {
      node.focus()
    }
  }, [])

  return (
    <GeneralModal {...otherProps}>
      <div>
        <label htmlFor='name'>{inputLabel}</label>
        <p className='modal-content__help-text'>{inputHelpText}</p>
      </div>
      
      <div>
        <NameErrorMessage />
        <input ref={inputBox} type='text' name='name' id='name' defaultValue={inputDefaultValue}></input>
      </div>
    </GeneralModal>
  )
}

export default InputModal
