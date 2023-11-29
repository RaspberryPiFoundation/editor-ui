import React from "react";
import ReactDOM from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import WebComponentLoader from "./containers/WebComponentLoader";
import store from "./app/WebComponentStore";
import { Provider } from "react-redux";
import "./utils/i18n";
import camelCase from "camelcase";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  environment: process.env.REACT_APP_SENTRY_ENV,

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

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
    return [
      "auth_key",
      "identifier",
      "code",
      "sense_hat_always_enabled",
      "instructions",
      "with_projectbar",
      "with_sidebar",
      "sidebar_options",
      "theme",
      "embedded",
    ];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    let value;

    if (
      ["sense_hat_always_enabled", "with_sidebar", "with_projectbar"].includes(
        name,
      )
    ) {
      value = newVal === "true";
    } else if (["instructions", "sidebar_options"].includes(name)) {
      value = JSON.parse(newVal);
    } else {
      value = newVal;
    }
    this.componentAttributes[camelCase(name)] = value;
    this.mountReactApp();
  }

  get editorCode() {
    // console.log('getting editor code');
    const state = store.getState();
    // console.log(state.editor.foo);
    return state.editor.project.components[0].content;
  }

  get menuItems() {
    return this.componentProperties.menuItems;
  }

  set menuItems(newValue) {
    // update properties in the web component via js calls from host app
    // see public/web-component/index.html
    console.log("menu items set");
    this.componentProperties.menuItems = newValue;

    this.mountReactApp();
  }

  reactProps() {
    return {
      ...this.componentAttributes,
      ...this.componentProperties,
    };
  }

  mountReactApp() {
    if (!this.mountPoint) {
      this.mountPoint = document.createElement("div");
      this.mountPoint.setAttribute("id", "root");
      this.mountPoint.setAttribute("part", "editor-root");
      this.attachShadow({ mode: "open" }).appendChild(this.mountPoint);
      this.root = ReactDOMClient.createRoot(this.mountPoint);
    }

    this.root.render(
      <React.StrictMode>
        <Provider store={store}>
          <WebComponentLoader {...this.reactProps()} />
        </Provider>
      </React.StrictMode>,
    );
  }
}

window.customElements.define("editor-wc", WebComponent);
