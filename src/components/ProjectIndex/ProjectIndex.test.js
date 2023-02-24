import { render, screen } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from 'redux-mock-store'
import { MockedProvider } from "@apollo/client/testing"

import { showRenamedMessage } from "../../utils/Notifications";
import { default as ProjectIndex, PROJECT_INDEX_QUERY } from "./ProjectIndex";

jest.mock('../../utils/Notifications')
jest.mock('date-fns')

const mockedUseNavigate = jest.fn()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUseNavigate
}));


const user = {
  access_token: 'myAccessToken',
  profile: {
    user: 'b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf'
  }
}

describe('When authenticated', () => {
  const auth = { user: user }

  describe ('When user has projects', () => {
    // Because we use fragments, we have to specify __typename for each entry
    // in the result
    const mocks = [
      {
        request: {
          query: PROJECT_INDEX_QUERY,
          variables: { userId: user.profile.user, first: 8 }
        },
        result: {
          data: {
            projects: {
              __typename: "ProjectConnection",
              edges: [
                {
                  __typename: "ProjectEdge",
                  cursor: "MQ",
                  node: {
                    __typename: "Project",
                    id: "abc",
                    name: "my project 1",
                    identifier: "amazing-1",
                    updatedAt: "2023-02-21T17:03:53Z",
                  },
                },
                {
                  __typename: "ProjectEdge",
                  cursor: "Mg",
                  node: {
                    __typename: "Project",
                    id: "def",
                    name: "my project 2",
                    identifier: "amazing-2",
                    updatedAt: "2023-02-20T21:04:42Z",
                  },
                },
              ],
              totalCount: 13,
              pageInfo: {
                __typename: "PageInfo",
                hasPreviousPage: false,
                startCursor: "MQ",
                endCursor: "Mg",
                hasNextPage: false,
              }
            }
          }
        }
      }
    ]

    beforeEach(() => {
      const initialState = {
        editor: {},
        auth: auth,
      }

      const mockStore = configureStore([])
      const store = mockStore(initialState)
      render (
        <Provider store={store}>
          <MemoryRouter>
            <MockedProvider mocks={mocks} addTypename={true}>
              <ProjectIndex user={user} isLoading={false} />
            </MockedProvider>
          </MemoryRouter>
        </Provider>
      )
    })

    it('Displays project titles', async () => {
      expect(await screen.findByText('my project 1')).toBeInTheDocument()
      expect(await screen.findByText('my project 2')).toBeInTheDocument()
    })

    it('Displays the pagination count', async () => {
      expect(await screen.findByText('1 / 2')).toBeInTheDocument()
    })
  }) // User has projects

  describe ('When saving is success', () => {
    const mocks = [
      {
        request: {
          query: PROJECT_INDEX_QUERY,
          variables: { userId: user.profile.user, first: 8 }
        },
        result: { data: { projects: {} } },
      }
    ]

    beforeEach(() => {
      const mockStore = configureStore([])
      const initialState = {
        editor: {
          saving: 'success'
        },
        auth: auth
      }

      const store = mockStore(initialState)
      render (
        <MockedProvider mocks={mocks}>
          <Provider store={store}>
            <ProjectIndex/>
          </Provider>
        </MockedProvider>
      )
    })

    test('Shows project renamed message', () => {
      expect(showRenamedMessage).toHaveBeenCalled()
    })
  })
}) // Authenticated


describe ('When unauthenticated', () => {
  const auth = {}

  beforeEach(() => {
    const mockStore = configureStore([])
    const initialState = {
      editor: {},
      auth: auth
    }
    const store = mockStore(initialState)
    render (
      <MockedProvider>
        <Provider store={store}>
          <ProjectIndex/>
        </Provider>
      </MockedProvider>
    )
  })

  it('navigates back to /', () => {
    expect(mockedUseNavigate).toHaveBeenCalledWith('/')
  })
})
