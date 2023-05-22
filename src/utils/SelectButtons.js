import React from "react";
import './SelectButtons.scss'
import { SelectButtonsTick } from "../Icons";

const SelectButtons = ({label, options, value, setValue}) => {
  return (
    <fieldset className='select-buttons'>
      <legend className='select-buttons__legend'>{label}</legend>
      <div className='select-buttons__options'>
        {options.map((option, i) => (
          <div className='select-buttons__option' key={i}>
            <input
              className='select-buttons__button'
              type='radio'
              id={`option${i}`}
              value={option.value}
              onChange={(e) => setValue(e.target.value)}
              checked={option.value === value}
            />
            <label className={`select-buttons__label${option.value === value ? ' select-buttons__label--selected': ''}`} htmlFor={`option${i}`}>
              {option.Icon ? <option.Icon/> : null}
                {option.label}
              {option.value === value ?
              <div className='select-buttons__tick'>
                <SelectButtonsTick />
              </div>
              : null}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  )
}

export default SelectButtons
