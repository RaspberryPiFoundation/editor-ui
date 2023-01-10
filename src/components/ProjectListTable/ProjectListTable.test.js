import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import ProjectListTable from './ProjectListTable';

const user = {
  access_token: 'myAccessToken',
  profile: {
    user: 'b48e70e2-d9ed-4a59-aee5-fc7cf09dbfaf'
  }
}

describe('When the logged in user has projects', () => {
  const project = {
    name: 'hello world',
      project_type: 'python',
      identifier: 'hello-world-project',
      components: [
        {
          name: 'main',
          extension: 'py',
          content: '# hello'
        }
      ],
      user_id: user.profile.user,
      updated_at: '2023-01-10T09:55:47.237Z'
  }

  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        projectList: [project]
      },
      auth: {
        user: user
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><ProjectListTable/></Provider>);
  });

  test('The projects page show a list of projects', () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });
});

describe('When the logged in user has no projects', () => {
  beforeEach(() => {
    const middlewares = [];
    const mockStore = configureStore(middlewares);
    const initialState = {
      editor: {
        projectList: []
      },
      auth: {
        user: user
      }
    }
    const store = mockStore(initialState);
    render(<Provider store={store}><ProjectListTable/></Provider>);
  });

  test('The projects page show an empty state message', () => {
    expect(screen.queryByText('projectList.empty')).toBeInTheDocument();
  });
});
