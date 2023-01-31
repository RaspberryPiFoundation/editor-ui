import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, DoubleChevronLeft, DoubleChevronRight } from "../../Icons";
import Button from "../Button/Button";
import { setProjectIndexPage } from "../Editor/EditorSlice";
import './ProjectIndexPagination.scss'

const ProjectIndexPagination = (props) => {
  // const {currentPage} = props
  const currentPage = useSelector((state) => state.editor.projectIndexCurrentPage)
  const totalPages = useSelector((state) => state.editor.projectIndexTotalPages)
  // const totalPages = links && links.last ? links.last.page : currentPage

  const dispatch = useDispatch()

  const goToPage = (pageNumber) => {
    dispatch(setProjectIndexPage(pageNumber))
  }

  return (
    <div className='editor-project-list-pagination'>
      <div className='editor-project-pagination__buttons'>
        { currentPage > 1 ? 
          <>
            {/* <a className='btn btn--tertiary' href = '/projects?page=1'><DoubleChevronLeft/></a>
            <a className='btn btn--primary' href = {`/projects?page=${currentPage-1}`}><ChevronLeft/></a> */}
            <Button className='btn--tertiary' ButtonIcon={DoubleChevronLeft} onClickHandler={() => goToPage(1)}/>
            <Button className='btn--primary' ButtonIcon={ChevronLeft} onClickHandler={() => goToPage(currentPage-1)}/>
          </>
          : null
        }
      </div>
      <span className='editor-project-list-pagination__current-page'>{currentPage} / {totalPages}</span>
      <div className='editor-project-pagination__buttons'>
        { currentPage < totalPages ? 
          <>
            {/* <a className='btn btn--primary' href = {`/projects?page=${currentPage+1}`}><ChevronRight/></a>
            <a className='btn btn--tertiary' href = {`/projects?page=${totalPages}`}><DoubleChevronRight/></a> */}
            <Button className='btn--primary' ButtonIcon={ChevronRight} onClickHandler={() => goToPage(currentPage+1)}/>
            <Button className='btn--tertiary' ButtonIcon={DoubleChevronRight} onClickHandler={() => goToPage(totalPages)}/>
          </>
          : null
        }
      </div>
    </div>
  )
}

export default ProjectIndexPagination
