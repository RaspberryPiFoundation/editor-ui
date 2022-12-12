import React from 'react';
import EmbeddedViewer from './EmbeddedViewer';

import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';

const middlewares = [];
const mockStore = configureStore(middlewares);

const initialState = {
    editor: {
      loading: 'success',
      project: {
        components: []
      }
    }
};
const store = mockStore(initialState);

test('Renders without crashing', () => {
  const match = { params: { } }
  const { asFragment } = render(
    <Provider store={store}>
      <EmbeddedViewer match={match} />
    </Provider>
  );
  expect(asFragment()).toMatchSnapshot();
});
