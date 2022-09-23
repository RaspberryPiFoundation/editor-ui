import React from "react";
import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

import { updateImages, setNameError } from '../../Editor/EditorSlice';
import { PencilIcon } from '../../../Icons'

const FileMenu = () => {
  const [modalIsOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch();
  const showModal = () => {
    dispatch(setNameError(""));
    setIsOpen(true)
  };

    return (
      <div className='dropdown-container dropdown-container--bottom file-menu'>
        <div className='file-menu__rename'>
            Rename File <button onClick={showModal}><PencilIcon /></button>
        </div>
      </div>
    )
}
  
export default FileMenu