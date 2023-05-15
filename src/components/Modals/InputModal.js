import React, { useCallback } from "react";
import GeneralModal from "./GeneralModal";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";

const InputModal = ({inputs, ...otherProps}) => {

  const inputBox = useCallback((node) => {
    if (node) {
      node.focus()
    }
  }, [])

  return (
    <GeneralModal {...otherProps}>
      {inputs.map((input, i) => (
        <>
          <div>
            <label htmlFor='name'>{input.label}</label>
            <p className='modal-content__help-text'>{input.helpText}</p>
          </div>
          <div className='modal-content__input' key={i}>
            <NameErrorMessage />
            <input ref={inputBox} type='text' name='name' id='name' defaultValue={input.defaultValue}></input>
          </div>
        </>
      ))}
    </GeneralModal>
  )
}

export default InputModal
