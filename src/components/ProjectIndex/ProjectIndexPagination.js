import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, DoubleChevronLeft, DoubleChevronRight } from "../../Icons";
import Button from "../Button/Button";
import { setProjectIndexPage } from "../Editor/EditorSlice";
import './ProjectIndexPagination.scss'

const ProjectIndexPagination = () => {
  const currentPage = useSelector((state) => state.editor.projectIndexCurrentPage)
  const totalPages = useSelector((state) => state.editor.projectIndexTotalPages)

  const dispatch = useDispatch()

  const goToPage = (pageNumber) => {
    dispatch(setProjectIndexPage(pageNumber))
  }

  return (
    <div className='editor-project-list-pagination'>
      <div className='editor-project-pagination__buttons'>
        { currentPage > 1 ? 
          <>
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
