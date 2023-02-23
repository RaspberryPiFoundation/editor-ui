import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ProjectIndexPagination } from "./ProjectIndexPagination";

const fetchMore = jest.fn()
const pageSize = 2

describe('When on the first page of projects', () => {
  const paginationData = {
    totalCount: 4,
    pageInfo: {
      startCursor: btoa(1),
      endCursor: btoa(2),
      hasNextPage: true,
      hasPreviousPage: false
    }
  }
  beforeEach(() => {
    render (
      <ProjectIndexPagination pageSize={ pageSize } paginationData = { paginationData } fetchMore = { fetchMore } />
    )
  })

  test('Next and last buttons shown', () => {
    expect(screen.queryByTitle('projectList.pagination.next')).toBeInTheDocument()
    expect(screen.queryByTitle('projectList.pagination.last')).toBeInTheDocument()
  })

  test('First and previous buttons not shown', () => {
    expect(screen.queryByTitle('projectList.pagination.first')).not.toBeInTheDocument()
    expect(screen.queryByTitle('projectList.pagination.previous')).not.toBeInTheDocument()
  })
})

describe('When on a middle page of projects', () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      startCursor: btoa(3),
      endCursor: btoa(4),
      hasNextPage: true,
      hasPreviousPage: true
    }
  }

  beforeEach(() => {
    render (
      <ProjectIndexPagination pageSize={ pageSize } paginationData = { paginationData } fetchMore = { fetchMore } />
    )
  })

  test('First and previous buttons shown', () => {
    expect(screen.queryByTitle('projectList.pagination.first')).toBeInTheDocument()
    expect(screen.queryByTitle('projectList.pagination.previous')).toBeInTheDocument()
  })

  test('Next and last buttons shown', () => {
    expect(screen.queryByTitle('projectList.pagination.next')).toBeInTheDocument()
    expect(screen.queryByTitle('projectList.pagination.last')).toBeInTheDocument()
  })

  test('Clicking the first button requests page 1', () => {
    const firstButton = screen.queryByTitle('projectList.pagination.first')
    fireEvent.click(firstButton)
    expect(fetchMore).toHaveBeenCalledWith({ variables: {first: pageSize} })
  })

  test('Clicking the previous button requests previous page', () => {
    const prevButton = screen.queryByTitle('projectList.pagination.previous')
    fireEvent.click(prevButton)
    expect(fetchMore).toHaveBeenCalledWith({ variables: {last: pageSize, first: null, before: paginationData.pageInfo.startCursor} })
  })

  test('Clicking the next button requests next page', () => {
    const nextButton = screen.queryByTitle('projectList.pagination.next')
    fireEvent.click(nextButton)
    expect(fetchMore).toHaveBeenCalledWith({ variables: {first: pageSize, after: paginationData.pageInfo.endCursor} })
  })

  test('Clicking the last button requests last page', () => {
    const lastButton = screen.queryByTitle('projectList.pagination.last')
    fireEvent.click(lastButton)
    expect(fetchMore).toHaveBeenCalledWith({ variables: {last: 1, first: null} })
  })
})

describe('When on the last page of projects', () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      startCursor: btoa(7),
      endCursor: btoa(7),
      hasNextPage: false,
      hasPreviousPage: true
    }
  }
  beforeEach(() => {
    render (
      <ProjectIndexPagination pageSize={ pageSize } paginationData = { paginationData } fetchMore = { fetchMore } />
    )
  })

  test('First and previous buttons shown', () => {
    expect(screen.queryByTitle('projectList.pagination.first')).toBeInTheDocument()
    expect(screen.queryByTitle('projectList.pagination.previous')).toBeInTheDocument()
  })
  test('Next and last buttons not shown', () => {
    expect(screen.queryByTitle('projectList.pagination.next')).not.toBeInTheDocument()
    expect(screen.queryByTitle('projectList.pagination.last')).not.toBeInTheDocument()
  })
})
