# Editor Web Component

To have the web component be able to use the same React components as the site application there needed to be a separate start script for the component. This required being able to customise how build was done and meant the `create-react-app` needed to be ejected. This copies configuration files into the project instead of running it all in create-react-app scripts.

There is a custom webpack config file for the component `webpack.config.js` and a script in the `package.json`: `start` which will start serving the web component.

In `public/web-component/index.html` the JavaScript output is added and the web-component mounted. Then viewing `http://localhost:3011` will load the page with the web component mounted.

## WebComponent Class

`src/web-component.js` defines the Web Component and mounts the React components and store.

Methods can be defined in the web component to allow getting or setting data in the component.

For example the `get editorCode()` method allows the host site to access the code written in the editor, an example of how to use it is in the `public/web-component/index.html` page.
The `set menuItems(newValue)` method shows how data could be set dynamically from outside the web component. This is probably not needed in the component and is only there as an example.

The `mountReactApp()` method creates a dom element attaches a shadow dom to it and then mounts the React application in it.

The `static get observedAttributes()` method returns an array of attributes that are allowed to be set on the web component. At present it returns `['code']` meaning you can add the code attribute:

`<editor-wc code="print('Hello component')"></editor-wc>`

Any other attributes set will not be available in the component and would need to be added to the observedAttributes to make them so.

The WebComponent class is then defined as a custom HTML element which can be used in a page once the JavaScript bundle has been added to the page.

## WebComponent events

In `src/components/WebComponent/Project/Project.js` there is an example of how the React application can fire custom events on the web component.
These events can be listened for in the host application as shown in the `public/web-component/index.html`.

The idea here would be to have the React app fire an event when the code has changed (using a debounce) which the host application can then use as a trigger to retrieve the code if it needs to.
For example the Astro Pi Mission Zero could check that the code uses the required methods.

More events could be added for code run starting and stopping to allow timing the code run for Mission Zero.

## Web Component Structure

Currently the WebComponent class mounts a `WebComponentLoader` React component and provides it with the same Redux store that the main application uses.
The WebComponent doesn't need access to the user information however so having it's own store that just uses the `EditorSlice` may be preferable in future.
If the data structure for the WebComponent differs greatly from the editor application it may be worth having a separate `WebComponentSlice` to handle it.

As the web component evolves it seems likely the two behaviours will converge and the web component will need all the same behaviour as the web application.
This behaviour would likely be configurable and it would be possible to use the same store for application and web component.

The `WebComponentLoader` takes the code passed into the web component on initialization and puts it into the Redux store. It then sets the project loaded flag and mounts the `WebComponent/Project` React component. This is very similar to the `Project` component in the full application and mounts the editor panel and python runner components.

## Considerations and Issues

Because of the way the shadow DOM works CSS styles will not be applied correctly to elements in the web component.
To get around this the `style-it` package has been added. This adds a `<style>` tag to the React component and uses a key to add styles within the shadow dom with greater specificity.
The `src/components/WebComponent/Project/Project.js` React component shows how multiple CSS files can be applied using this method.
This conflicts with the way that styles are applied normally so having a single place within the web component that styles are added like this is probably the way forward.

Another problem with shadow DOM is that elements mounted on the shadow DOM can not be found in the usual way from the host application.
This means that `document.getElementById()` or `document.querySelector()` can't be used to get a reference to DOM elements in the shadow DOM.
This is an issue because some of the external/third party libraries we use may be using these methods to obtain DOM elements for rendering etc.
For example passing the ID of an output canvas into skulpt causes turtle to error when it tries to lookup that canvas to draw into.
This can be overcome by passing the element itself in this instance but this may not always be possible.

## Thoughts on future development

Can the starter code for the web component be added to the element as content instead of being set by a property?
Instead of: `<editor-wc code="print('Hello component')"></editor-wc>`
Could we have:

```
<editor-wc>
  print('here is python code')
  print('and more code')
</editor-wc>
```

Is there a better way to expose events from the component?
Is there a better way to fire events from the React application, having to get the web component DOM element and add a custom event to it feels hacky.
