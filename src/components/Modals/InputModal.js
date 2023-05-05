import React, { useCallback } from "react";
import GeneralModal from "./GeneralModal";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";

const InputModal = ({inputLabel, submitCallback, ...otherProps}) => {

  const inputBox = useCallback((node) => {
    if (node) {
      node.focus()
    }
  }, [])

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      submitCallback()
    }
  }

  return (
    <GeneralModal {...otherProps}>
      <label htmlFor='name'>{inputLabel}</label>
      <div>
        <NameErrorMessage />
        <input ref={inputBox} type='text' name='name' id='name' onKeyDown={onKeyDown}></input>
      </div>
    </GeneralModal>
  )
}

export default InputModal
