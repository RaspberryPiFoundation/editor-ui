import './App.css';
import { OidcProvider } from 'redux-oidc';
import { Provider } from 'react-redux'

import Routes from './components/Routes'
import store from './components/store'
import userManager from './utils/userManager'

function App() {

  return (
    <Provider store={store}>
      <OidcProvider store={store} userManager={userManager}>
        <div className="App">
          <Routes />
        </div>
      </OidcProvider>
    </Provider>
  );
}

export default App;
