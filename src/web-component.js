import React from "react";
import * as ReactDOMClient from "react-dom/client";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import WebComponentLoader from "./containers/WebComponentLoader";
import store from "./redux/stores/WebComponentStore";
import { Provider } from "react-redux";
import "./utils/i18n";
import camelCase from "camelcase";
import { stopCodeRun, stopDraw, triggerCodeRun } from "./redux/EditorSlice";
import { BrowserRouter } from "react-router-dom";
import { resetStore } from "./redux/RootSlice";

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
  sidebarPlugins = [];

  connectedCallback() {
    if (!this.shadowRoot) {
      this.mountPoint = this.shadowRoot;
    }

    console.log("Mounted web-component...");

    this.mountReactApp();
  }

  disconnectedCallback() {
    if (this.root) {
      console.log("Unmounted web-component...");
      this.root.unmount();
    }
    store.dispatch(resetStore());
  }

  static get observedAttributes() {
    return [
      "assets_identifier",
      "auth_key",
      "code",
      "editable_instructions",
      "embedded",
      "host_styles",
      "identifier",
      "instructions",
      "load_remix_disabled",
      "locale",
      "output_only",
      "output_panels",
      "output_split_view",
      "project_name_editable",
      "react_app_api_endpoint",
      "read_only",
      "sense_hat_always_enabled",
      "show_save_prompt",
      "sidebar_options",
      "theme",
      "use_editor_styles",
      "with_projectbar",
      "with_sidebar",
      "load_cache",
    ];
  }

  attributeChangedCallback(name, _oldVal, newVal) {
    let value;

    if (
      [
        "embedded",
        "editable_instructions",
        "load_remix_disabled",
        "output_only",
        "output_split_view",
        "project_name_editable",
        "read_only",
        "sense_hat_always_enabled",
        "show_save_prompt",
        "use_editor_styles",
        "with_projectbar",
        "with_sidebar",
        "load_cache",
      ].includes(name)
    ) {
      value = newVal !== "false";
    } else if (
      [
        "instructions",
        "sidebar_options",
        "host_styles",
        "output_panels",
      ].includes(name)
    ) {
      value = JSON.parse(newVal);
    } else {
      value = newVal;
    }
    this.componentAttributes[camelCase(name)] = value;
    this.mountReactApp();
  }

  setSidebarPlugins(sidebarPlugins) {
    this.sidebarPlugins = sidebarPlugins;
    this.mountReactApp();
  }

  get editorCode() {
    const state = store.getState();
    return state.editor.project.components[0]?.content;
  }

  get menuItems() {
    return this.componentProperties.menuItems;
  }

  set menuItems(newValue) {
    // update properties in the web component via js calls from host app
    // see public/web-component/index.html
    this.componentProperties.menuItems = newValue;

    this.mountReactApp();
  }

  stopCode() {
    const state = store.getState();
    if (state.editor.codeRunTriggered || state.editor.drawTriggered) {
      store.dispatch(stopCodeRun());
      store.dispatch(stopDraw());
    }
  }

  runCode() {
    store.dispatch(triggerCodeRun());
  }

  rerunCode() {
    this.stopCode();

    new Promise((resolve) => {
      let checkInterval = setInterval(() => {
        let state = store.getState();
        if (!state.codeRunTriggered && !state.drawTriggered) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
    }).then(() => {
      this.runCode();
    });
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
          <BrowserRouter>
            <WebComponentLoader
              sidebarPlugins={this.sidebarPlugins}
              {...this.reactProps()}
            />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>,
    );
  }
}

if (!window.customElements.get("editor-wc")) {
  window.customElements.define("editor-wc", WebComponent);
}
