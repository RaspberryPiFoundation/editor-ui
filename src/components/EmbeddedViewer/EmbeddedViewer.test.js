import React from 'react';
import renderer from 'react-test-renderer';
import EmbeddedViewer from './EmbeddedViewer';

import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

const middlewares = [];
const mockStore = configureStore(middlewares);

const initialState = {
    editor: {
      projectLoaded: true,
      project: {
        components: []
      }
    }
};
const store = mockStore(initialState);

test('Renders without crashing', () => {
  const match = { params: { } }
  const component = renderer.create(
    <Provider store={store}>
      <EmbeddedViewer match={match} />
    </Provider>
  );
  let tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
