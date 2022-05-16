# HTML editing

## Routing

Visiting `/html` will mount the ProjectComponentLoader and set the project type to HTML.
If there is no project identifier to use when requesting a project from the api e.g. `/html/project-id-string` the `useProject` hook will load a default HTML project.
The default project (python default code too) is currently stored in the `useProject` hook file.

## Rendering

Once the project code has been set the `Project` component will render the project editor tabs each one displaying an `EditorPanel`.
The panel will be set to a different mode depending on the component that it is rendering.
Currently supported modes:
  - html
  - css
  - python

A JavaScript mode will need adding to support separate JavaScript component files.
You can use js in `<script>` tags in html components and it will work as expected.

The `Project` component also mounts a `RunnerFactory` component which will load the `HtmlRunner` or `PythonRunner` depending on the project type. I'm not sure this is the most "Reacty" way to handle this and could be something to look at or refactor in future.

## HTMLRunner

The HTML runner iterates through the project components and generates a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) for each.
It gets a URL for each blob and then renders the blob generated from the `index.html` component into an iframe.

This means that the browser is used to render the project and the pages rendered are stored in memory in the browser.

To ensure pages work as if they were being written in a folder with relative paths there has to be some processing of the project before the blob URLs are created.
Blob URLs are created for CSS files first and then the `index.html` page is searched and any instances where a `href` is present which references the CSS file component are replaced with the blob URL.

e.g. `href="styles.css"` is replaced with `href="<<generated blob url>>"`. This means when the HTML page blob is loaded it correctly references the blobs for any linked styles.

The runner re-renders when the project code updates. To prevent constant re-rendering this is debounced. When the code is changed a timeout is set for 2 seconds. If the code changes again that timeout is reset. Once 2 seconds have passed without a change the changes are sent to the redux store and the render is triggered in the runner.
Currently the debouncing is done in the `EditorPanel`. This is probably the wrong place to do it. The panel should just persist the code changes (so behaviour is the same for all types of code), the `HTMLRunner` should watch for the changes and handle the debouncing itself.

## Limitations and Enhancements

This was implemented quickly and has not been developed or enhanced as we have been focussing on implementing the Python functionality.

You can not currently add new components to an HTML project. This should be a small fix as currently the `NewComponentButton` is just hidden if it is not a Python project. Showing this will be simple and allowing the required file types is also a small fix.

JavaScript file support will need adding to the `EditorPanel` component and also into the blob generation of the `HTMLRunner`. Links to JavaScript files will also need to be handled in the same way that CSS files are.

Links to other added HTML files in the project will also need to be handled once they can be added.

As the output is displayed in an iframe linking to external sites will not work if the `X-Frame-Options` header is set to `sameorigin` on that site.

Being able to add JavaScript to the projects which could then be autorun in an embedded view (perhaps in a hidden iframe) could open up some security issues. We need to think about the implications of this and how any issues can be mitigated.

It is not currently possible to create a new HTML project. To allow this there would need to be a wayto choose project type when creating a new project on the UI projects page.
The API would also need to be amended to handle creating an HTML project as it can only handle Python projects at the moment.
