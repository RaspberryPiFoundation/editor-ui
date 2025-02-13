import React, { useEffect, useState } from "react";
import * as ReactDOMClient from "react-dom/client";

const CodeEditor = () => {
  const searchParams = new URLSearchParams(window.location.search);

  const wc_with_projectbar = searchParams.get("with_projectbar");
  const wc_with_sidebar = searchParams.get("with_sidebar");
  const wc_editable_instructions = searchParams.get("editable_instructions");
  const wc_read_only = searchParams.get("read_only");
  const wc_use_editor_styles = searchParams.get("use_editor_styles");
  const wc_show_save_prompt = searchParams.get("show_save_prompt");
  const wc_embedded = searchParams.get("embedded");
  const wc_output_only = searchParams.get("output_only");
  const wc_output_split_view = searchParams.get("output_split_view");
  const wc_load_cache = searchParams.getAll("load_cache").at(-1) || "true";

  console.log('wc_load_cache', wc_load_cache);

  const [webComponentEvents, setWebComponentEvents] = useState([]);

  // assets_identifier`: Load assets (not code) from this project identifier
  // auth_key`: Authenticate the user to allow them to make API requests such as saving their work
  // code`: A preset blob of code to show in the editor pane (overrides content of `main.py`/`index.html`)
  // host_styles`: Styles passed into the web component from the host page
  // identifier`: Load the project with this identifier from the database
  // instructions`: Stringified JSON containing steps to be displayed in the instructions panel in the sidebar
  //
  // load_remix_disabled`: Do not load a logged-in user's remixed version of the project specified by `identifier` even if one exists (defaults to `false`)
  // output_panels`: Array of output panel names to display (defaults to `["text", "visual"]`)
  // project_name_editable`: Allow the user to edit the project name in the project bar (defaults to `false`)
  // react_app_api_endpoint`: API endpoint to send project-related requests to
  // sense_hat_always_enabled`: Show the Astro Pi Sense HAT emulator on page load (defaults to `false`)
  // sidebar_options`: Array of strings specifying the panels to be displayed in the sidebar (defaults to an empty array). The options that can be included are `"projects"`, `"instructions"`, `"file"`, `"images"`, `"download"`, `"settings"` and `"info"`.
  // theme`: Force editor into `"dark"` or `"light"` mode - browser or system preferences will be used if not specified

  useEffect(() => {
    const knownWebComponentEvents = [
      "editor-codeChanged",
      "editor-navigateToProjectsPage",
      "editor-projectIdentifierChanged",
      "editor-projectOwnerLoaded",
      "editor-runCompleted",
      "editor-runStarted",
      "editor-stepChanged",
      "editor-logIn",
      "editor-signUp",
      "editor-quizReady",
      "editor-themeUpdated",
    ];

    const webComponentEventHandler = (e) => {
      console.log(e);
      setWebComponentEvents([...webComponentEvents, e.type]);
    };

    knownWebComponentEvents.forEach((event) => {
      window.addEventListener(event, webComponentEventHandler);
    });

    return () => {
      knownWebComponentEvents.forEach((event) => {
        window.removeEventListener(event, webComponentEventHandler);
      });
    };
  });

  return (
    <>
      <h1>Code Editor Web Component Playground</h1>

      <form method="get">
        <div>
          <label>
            <input
              type="checkbox"
              name="with_projectbar"
              defaultChecked={wc_with_projectbar}
            />
            with_projectbar? Show the project bar containing project name and
            save status (defaults to `false`)
          </label>
        </div>
        <div>
          <label>
            <input type="hidden" name="load_cache" value="false" />
            <input
              type="checkbox"
              name="load_cache"
              value="true"
              defaultChecked={wc_load_cache === "true"}
            />
            load_cache`: Load latest version of project code from local storage (defaults to `true`)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="with_sidebar"
              defaultChecked={wc_with_sidebar}
            />
            with_sidebar? Show the sidebar (defaults to `false`)
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" name="read_only" defaultChecked={wc_read_only} />
            read_only? Display the editor in read only mode (defaults to
            `false`)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="output_only"
              defaultChecked={wc_output_only}
            />
            output_only? Only display the output panel (defaults to `false`)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="use_editor_styles"
              defaultChecked={wc_use_editor_styles}
            />
            use_editor_styles? Style web component using themes for the main
            editor site (defaults to `false`)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="show_save_prompt"
              defaultChecked={wc_show_save_prompt}
            />
            show_save_prompt`: Prompt the user to save their work (defaults to
            `false`)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="output_split_view"
              defaultChecked={wc_output_split_view}
            />
            TODO: output_split_view? Start with split view in output panel
            (defaults to `false`, i.e. tabbed view)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="embedded"
              defaultChecked={wc_embedded}
            />
            embedded? Enable embedded mode which hides some functionality
            (defaults to `false`)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="editable_instructions"
              defaultChecked={wc_editable_instructions}
            />
            TODO: editable_instructions? Boolean whether to show edit panel for
            instructions (defaults to `false`)
          </label>
        </div>
        <button type="submit">Update</button>
      </form>

      <div>
        <editor-wc
          with_projectbar={wc_with_projectbar}
          with_sidebar={wc_with_sidebar}
          editable_instructions={wc_editable_instructions}
          embedded={wc_embedded}
          output_only={wc_output_only}
          output_split_view={wc_output_split_view}
          use_editor_styles={wc_use_editor_styles}
          read_only={wc_read_only}
          show_save_prompt={wc_show_save_prompt}
          load_cache={wc_load_cache}
        ></editor-wc>
      </div>

      <section>
        <h1>Events</h1>

        {webComponentEvents.map((event) => (
          <div key={event}>{event}</div>
        ))}
      </section>
    </>
  );
};

const mountPoint = document.getElementById("app");
const root = ReactDOMClient.createRoot(mountPoint);
root.render(<CodeEditor />);
