import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { Route, Router, MemoryRouter, Link } from "react-router-dom";
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux'
import { createMemoryHistory } from 'history';
import configureStore from 'redux-mock-store';
import App from '../App';

let store
// let testHistory, testLocation;

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
}

beforeEach(() => {
  const mockStore = configureStore([])
  const initialState = {
    editor: {
      project,
    },
    auth: {}
  }
  store = mockStore(initialState);
})

// const ProjectRoute = () => (
//   <div>
//     <Route
//       path='/'
//       render={({ history, location }) => {
//         testHistory = history;
//         testLocation = location;
//         return (
//           <div>
//             <Link to='/python/hello-world-project' id='click-me'>
//               Project Page
//             </Link>
//           </div>
//         )
//       }}
//     />
//   </div>
// );

// const ProjectLink = () => {
//   return (
//     <div>
//       <Link to='/python/hello-world-project' id='click-me'>
//         Project Page
//       </Link>
//     </div>
//   )
// }

// test('shows the redirected project page', () => {
//   render(
//     <MemoryRouter>
//       <Provider store={store}>
//         <Routes />
//         <ProjectLink />
//       </Provider>
//     </MemoryRouter>
//   );

//   // console.log(testLocation.pathname)

//   act(() => {
//     const goToProjectPage = document.querySelector('#click-me');
//     fireEvent.click(goToProjectPage)
//   });

//   // console.log(testLocation.pathname)
// });

test('landing on a bad page', () => {
  const history = createMemoryHistory()
  history.push(`/${project.project_type}/${project.identifier}`)
  render(
    <Provider store={store}>
      <Router history={history} forceRefresh={true}>
        <App />
        {/* <ProjectLink /> */}
      </Router>
    </Provider>
  )
  console.log(history)
  // expect(screen.getByText(/no match/i)).toBeInTheDocument()
  // await waitFor(() => console.log(history));

  // act(() => {
  //   const goToProjectPage = document.querySelector('#click-me');
  //   fireEvent.click(goToProjectPage)
  //   console.log(goToProjectPage)
  //   console.log(history)
  // });
})