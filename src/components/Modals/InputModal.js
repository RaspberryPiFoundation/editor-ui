import React, { useCallback } from "react";
import GeneralModal from "./GeneralModal";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";
import SelectButtons from "../../utils/SelectButtons";

const InputModal = ({inputs, ...otherProps}) => {

  const inputBox = useCallback((node) => {
    if (node) {
      node.select()
    }
  }, [])

  return (
    <GeneralModal {...otherProps}>
      <div className='modal-content__inputs'>
        {inputs.map((input, i) => (
          <div key={i}>
            {input.type==='radio' ?
              <SelectButtons
                label={input.label}
                options={input.options}
                value={input.value}
                setValue={input.setValue}
              />
            :
            <div className='modal-content__input-section'>
              <label htmlFor={i}>
                {input.label}
                <p className='modal-content__help-text'>{input.helpText}</p>
              </label>
              <div className='modal-content__input'>
                {input.validateName ? <NameErrorMessage /> : null }
                <input
                  ref={i===0 ? inputBox : null}
                  type='text'
                  id={i}
                  onChange={(e) => input.setValue(e.target.value)}
                  value={input.value}/>
              </div>
            </div>
            }
          </div>
        ))}
      </div>
    </GeneralModal>
  )
}

export default InputModal
