import React from 'react';
import ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';
import WebComponentLoader from './components/WebComponent/WebComponentLoader/WebComponentLoader';
import store from './app/store'
import { Provider } from 'react-redux'

class WebComponent extends HTMLElement {
  root;
  mountPoint;
  componentAttributes = {};
  componentProperties = {};

  connectedCallback() {
    this.mountReactApp();
  }

  disconnectedCallback() {
    ReactDOM.unmountComponentAtNode(this.mountPoint);
  }

  static get observedAttributes() {
    return ['code'];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    // console.log(name, newVal)
    this.componentAttributes[name] = newVal;

    this.mountReactApp();
  }

  get editorCode() {
    // console.log('getting editor code');
    const state = store.getState();
    // console.log(state.editor.foo);
    return state.editor.project.components[0].content;
  }

  get isErrorFree() {
    const state = store.getState();
    return state.editor.error === ""
  }

  get menuItems() {
    return this.componentProperties.menuItems;
  }

  set menuItems(newValue) {
    // update properties in the web componet via js calls from host app
    // see public/web-component/index.html
    console.log('menu items set')
    this.componentProperties.menuItems = newValue;

    this.mountReactApp();
  }

  reactProps() {
    return { ...this.componentAttributes, ...this.componentProperties };
  }

  mountReactApp() {
    if (!this.mountPoint) {
      this.mountPoint = document.createElement('div');
      this.mountPoint.setAttribute("id", "root");
      this.attachShadow({ mode: 'open' }).appendChild(this.mountPoint);
      this.root = ReactDOMClient.createRoot(this.mountPoint);
    }

    this.root.render(
      <React.StrictMode>
        <Provider store={store}>
            <WebComponentLoader { ...this.reactProps() }/>
        </Provider>
      </React.StrictMode>
    );
  }
}

window.customElements.define('editor-wc', WebComponent);
