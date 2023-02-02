import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import configureStore from 'redux-mock-store'
import { setProjectIndexPage } from "../Editor/EditorSlice";

import ProjectIndexPagination from "./ProjectIndexPagination";

describe('When on the first page of projects', () => {
  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {
        projectIndexCurrentPage: 1,
        projectIndexTotalPages: 3
      },
      auth: {}
    }
    const store = mockStore(initialState)
    render (
      <Provider store={store}>
        <ProjectIndexPagination />
      </Provider>
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
  let store

  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {
        projectIndexCurrentPage: 3,
        projectIndexTotalPages: 5
      },
      auth: {}
    }
    store = mockStore(initialState)
    render (
      <Provider store={store}>
        <ProjectIndexPagination />
      </Provider>
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
    expect(store.getActions()).toEqual([setProjectIndexPage(1)])
  })

  test('Clicking the previous button requests previous page', () => {
    const prevButton = screen.queryByTitle('projectList.pagination.previous')
    fireEvent.click(prevButton)
    expect(store.getActions()).toEqual([setProjectIndexPage(2)])
  })

  test('Clicking the next button requests next page', () => {
    const nextButton = screen.queryByTitle('projectList.pagination.next')
    fireEvent.click(nextButton)
    expect(store.getActions()).toEqual([setProjectIndexPage(4)])
  })

  test('Clicking the last button requests last page', () => {
    const lastButton = screen.queryByTitle('projectList.pagination.last')
    fireEvent.click(lastButton)
    expect(store.getActions()).toEqual([setProjectIndexPage(5)])
  })
})

describe('When on the last page of projects', () => {
  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {
        projectIndexCurrentPage: 3,
        projectIndexTotalPages: 3
      },
      auth: {}
    }
    const store = mockStore(initialState)
    render (
      <Provider store={store}>
        <ProjectIndexPagination />
      </Provider>
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
