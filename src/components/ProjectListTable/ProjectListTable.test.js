import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { ProjectListTable } from './ProjectListTable';

describe('When the logged in user has projects', () => {
  const project = {
    name: 'hello world',
    project_type: 'python',
    identifier: 'hello-world-project',
    updatedAt: Date.now()
  }

  const projectData = {
    edges: [{
      cursor: "Mq",
      node: { ...project }
    }]
  }

  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = {}
    const store = mockStore(initialState)

    render(<Provider store={store}><MemoryRouter><ProjectListTable projectData = { projectData } /></MemoryRouter></Provider>);
  });

  test('The projects page show a list of projects', () => {
    expect(screen.queryByText(project.name)).toBeInTheDocument();
  });
});

describe('When the logged in user has no projects', () => {
  const projectData = {
    edges: []
  }

  beforeEach(() => {
    const mockStore = configureStore([]);
    const initialState = { }
    const store = mockStore(initialState);
    render(<Provider store={store}><MemoryRouter><ProjectListTable projectData = { projectData } /></MemoryRouter></Provider>);
  });

  test('The projects page show an empty state message', () => {
    expect(screen.queryByText('projectList.empty')).toBeInTheDocument();
  });
});
