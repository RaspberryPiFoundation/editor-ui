import React from 'react'
import './ErrorMessage.scss'
import { useSelector } from 'react-redux'

const ErrorMessage = () => {
  const error = useSelector((state) => state.editor.error);

  return error ? (
    <div className='error-message'>
      <p className='error-message--content'>{ error }</p>
    </div>
  ) : null;
};

export default ErrorMessage;
