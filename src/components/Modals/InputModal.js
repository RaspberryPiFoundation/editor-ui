import React, { useCallback } from "react";
import GeneralModal from "./GeneralModal";
import NameErrorMessage from "../Editor/ErrorMessage/NameErrorMessage";
import SelectButtons from "../../utils/SelectButtons";

const InputModal = ({inputs, ...otherProps}) => {

  const inputBox = useCallback((node) => {
    if (node) {
      node.focus()
    }
  }, [])

  return (
    <GeneralModal {...otherProps}>
      <div className='modal-content__inputs'>
        {inputs.map((input, i) => (
          <div key={i}>
            {input.type==='radio' ?
            <>
              {/* <div>
                <label htmlFor={i}>{input.label}</label>
                <p className='modal-content__help-text'>{input.helpText}</p>
              </div> */}
              <SelectButtons
                label={input.label}
                options={input.options}
                value={input.value}
                setValue={input.setValue}
              />
            </>
            :
            <>
              <div>
                <label htmlFor={i}>{input.label}</label>
                <p className='modal-content__help-text'>{input.helpText}</p>
              </div>
              <div className='modal-content__input'>
                <NameErrorMessage />
                <input
                  ref={inputBox}
                  type='text'
                  id={i}
                  onChange={(e) => input.setValue(e.target.value)}
                  value={input.value}/>
              </div>
            </>
            }
          </div>
        ))}
      </div>
    </GeneralModal>
  )
}

export default InputModal
