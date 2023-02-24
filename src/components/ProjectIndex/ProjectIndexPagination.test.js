import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { ProjectIndexPagination } from "./ProjectIndexPagination";

const fetchMore = jest.fn()
const pageSize = 2

describe('When pageInfo is missing', () => {
  const paginationData = {
    totalCount: 2
  }

  beforeEach(() => {
    render (
      <ProjectIndexPagination pageSize={ pageSize } paginationData = { paginationData } fetchMore = { fetchMore } />
    )
  })

  test('It doesn\'t show the navigation', () => {
    expect(screen.queryByTestId('projectIndexPagination')).not.toBeInTheDocument()
  })
})

describe('When totalCount is missing', () => {
  const paginationData = {
    pageInfo: {}
  }

  beforeEach(() => {
    render (
      <ProjectIndexPagination pageSize={ pageSize } paginationData = { paginationData } fetchMore = { fetchMore } />
    )
  })

  test('It doesn\'t show the navigation', () => {
    expect(screen.queryByTestId('projectIndexPagination')).not.toBeInTheDocument()
  })
})

describe('When on the first page of projects', () => {
  const paginationData = {
    totalCount: 7,
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

  test('Current page shown', () => {
    expect(screen.queryByText('1 / 4')).toBeInTheDocument()
  })
})

describe('When the endCursor is missing', () => {
  const paginationData = {
    totalCount: 7,
    pageInfo: {
      hasNextPage: true,
      hasPreviousPage: false
    }
  }
  beforeEach(() => {
    render (
      <ProjectIndexPagination pageSize={ pageSize } paginationData = { paginationData } fetchMore = { fetchMore } />
    )
  })

  test('Assume we\'re on page 1', () => {
    expect(screen.queryByText('1 / 4')).toBeInTheDocument()
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

  test('Current page shown', () => {
    expect(screen.queryByText('2 / 4')).toBeInTheDocument()
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

describe('If the total count is divisble by the page size', () => {
  const paginationData = {
    totalCount: 8,
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

  test('Clicking the last button requests last page', () => {
    const lastButton = screen.queryByTitle('projectList.pagination.last')
    fireEvent.click(lastButton)
    expect(fetchMore).toHaveBeenCalledWith({ variables: {last: 2, first: null} })
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

  test('Current page shown', () => {
    expect(screen.queryByText('4 / 4')).toBeInTheDocument()
  })
})
