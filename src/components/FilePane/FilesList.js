import React from "react";
import { useSelector } from "react-redux";

import Dropdown from '../Menus/Dropdown/Dropdown'
import { ChevronDown, FileIcon, EllipsisVerticalIcon } from '../../Icons';
import FileMenu from '../Menus/FileMenu/FileMenu';
import NewComponentButton from "../Editor/NewComponentButton/NewComponentButton";
import { useTranslation } from "react-i18next";

const FilesList = () => {
  const project = useSelector((state) => state.editor.project)
  const { t } = useTranslation()

  return (
    <details className = "file-pane-section file-pane-section__files" open>
      <summary>
        <h2 className="menu-pop-out-subheading" >{t('filePane.files')}</h2>
        <div className="accordion-icon">
          <ChevronDown />
        </div>
      </summary>
      <NewComponentButton />
      <div className='files-list'>
      { project.components.map((file, i) => (
      <div className='files-list-item' key={i}>
        <FileIcon />
        <p className='file-list-item-name'>{file.name}.{file.extension}</p>
        <Dropdown
            ButtonIcon={EllipsisVerticalIcon}
            buttonText=''
            buttonTextClassName=''
            MenuContent={FileMenu} />
      </div>
      ))}
      </div>
    </details>
  )
}

export default FilesList
