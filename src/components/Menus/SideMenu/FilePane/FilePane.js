import React from "react"
import { gql } from '@apollo/client';

import { ProjectImages, PROJECT_IMAGES_FRAGMENT } from "./ProjectImages/ProjectImages"
import { FilesList, FILES_LIST_FRAGMENT } from "./FilesList"

import './FilePane.scss'

export const FILE_PANE_FRAGMENT = gql`
  fragment FilePaneFragment on Project {
    components {
      ...FilesListFragment
    }
    images {
      ...ProjectImagesFragment
      totalCount
    }
  }

  ${FILES_LIST_FRAGMENT}
  ${PROJECT_IMAGES_FRAGMENT}
`

export const FilePane = (props) => {
  const {openFileTab, filePaneData}  = props

  return (
    <div className = "file-pane">
      <FilesList openFileTab = {openFileTab} filesListData={filePaneData.components} />
      {filePaneData?.images?.totalCount && filePaneData.images.totalCount > 0 ? <ProjectImages projectImagesData={filePaneData.images} /> : null}
    </div>
  )
}

