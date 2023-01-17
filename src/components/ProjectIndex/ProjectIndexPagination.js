import React from "react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, DoubleChevronLeft, DoubleChevronRight } from "../../Icons";
import './ProjectIndexPagination.scss'

const ProjectIndexPagination = (props) => {
  const {currentPage} = props
  const links = useSelector((state) => state.editor.projectIndexLinks)
  const totalPages = links.last ? links.last.page : currentPage

  return (
    <div className='editor-project-list-pagination'>
      { currentPage > 1 ? 
        <>
          <a className='btn btn--tertiary' href = '/projects?page=1'><DoubleChevronLeft/></a>
          <a className='btn btn--primary' href = {`/projects?page=${currentPage-1}`}><ChevronLeft/></a>
        </>
        : null
      }
      <span>{currentPage}/{totalPages}</span>
      { currentPage < totalPages ? 
        <>
          <a className='btn btn--primary' href = {`/projects?page=${currentPage+1}`}><ChevronRight/></a>
          <a className='btn btn--tertiary' href = {`/projects?page=${totalPages}`}><DoubleChevronRight/></a>
        </>
        : null
      }
    </div>
  )
}

export default ProjectIndexPagination
