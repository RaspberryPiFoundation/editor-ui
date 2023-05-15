import React, { useCallback } from "react";
import GeneralModal from "./GeneralModal";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";

const InputModal = ({inputLabel, inputDefaultValue, ...otherProps}) => {

  const inputBox = useCallback((node) => {
    if (node) {
      node.focus()
    }
  }, [])

  return (
    <GeneralModal {...otherProps}>
      <label htmlFor='name'>{inputLabel}</label>
      <div>
        <NameErrorMessage />
        <input ref={inputBox} type='text' name='name' id='name' defaultValue={inputDefaultValue}></input>
      </div>
    </GeneralModal>
  )
}

export default InputModal
