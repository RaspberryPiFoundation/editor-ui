import { useDispatch, useSelector } from "react-redux";

import { ChevronDown, FileIcon } from '../../Icons';
import FileMenu from '../Menus/FileMenu/FileMenu';
import NewComponentButton from "../Editor/NewComponentButton/NewComponentButton";
import { useTranslation } from "react-i18next";

import './FilesList.scss'
import { openFile } from "../Editor/EditorSlice";

const FilesList = (props) => {
  const project = useSelector((state) => state.editor.project)
  // const {openFileTab} = props
  const { t } = useTranslation()
  const dispatch = useDispatch()
  
  const openFileTab = (file) => {
    const fileName = `${file.name}.${file.extension}`
    dispatch(openFile(fileName))
  }

  return (
    <details className = "file-pane-section file-pane-section__files" open>
      <summary>
        <FileIcon scaleFactor={1.25}/>
        <h2>{t('filePane.files')}</h2>
        <div className="accordion-icon">
          <ChevronDown />
        </div>
      </summary>
      <NewComponentButton />
      <div className='files-list'>
      { project.components.map((file, i) => (
        <div className='files-list-item' key={i}>
          <div className='files-list-item__label' onClick={() => openFileTab(file)}>
            <FileIcon />
            <span className='files-list-item__name'>{file.name}.{file.extension}</span>
          </div>
          {(file.name === 'main' && file.extension === 'py') ? null :
            <div className='files-list-item__menu'>
              <FileMenu fileKey={i} name={file.name} ext={file.extension} />
            </div>
          }
        </div>
      ))}
      </div>
    </details>
  )
}

export default FilesList
