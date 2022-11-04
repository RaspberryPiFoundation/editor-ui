import React from "react";
import { ChevronDown, FileIcon } from '../../../Icons';

import { useSelector } from "react-redux";
import NewComponentButton from "../../Editor/NewComponentButton/NewComponentButton";
import RenameFile from "./RenameFile";
import { useTranslation } from "react-i18next";

const FilesList = () => {
  const project = useSelector((state) => state.editor.project)
  const { t } = useTranslation()

  return (
    <details className = "file-menu-section file-menu-section__files" open>
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
        <RenameFile currentName={file.name} currentExtension={file.extension} fileKey={i}/>
      </div>
      ))}
      </div>
    </details>
  )
}

export default FilesList
