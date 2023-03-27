import { gql } from '@apollo/client';

import { ChevronDown, FileIcon } from '../../../../Icons';
import FileMenu from '../../FileMenu/FileMenu';
import NewComponentButton from "../../../Editor/NewComponentButton/NewComponentButton";
import { useTranslation } from "react-i18next";

import './FilesList.scss'

export const FILES_LIST_FRAGMENT = gql`
  fragment FilesListFragment on ComponentConnection {
    nodes {
      name
      extension
    }
  }
`

export const FilesList = (props) => {
  const {openFileTab, filesListData} = props
  const { t } = useTranslation()

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
      { filesListData.nodes.map((file, i) => (
        <div className='files-list-item' key={i} onClick={() => openFileTab(`${file.name}.${file.extension}`)}>
          <div className='files-list-icon'>
            <FileIcon />
          </div>
          <span className='files-list-item__name'>{file.name}.{file.extension}</span>
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

