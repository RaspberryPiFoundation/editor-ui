# Getting Started

This project provides a web component containing the Raspberry Pi Code Editor for use on other sites. Although originally bootstrapped with [Create React App](https://github.com/facebook/create-react-app), the application has been ejected so all the build scripts etc. are now in the repo.

## Environment variables

The app uses the `dotenv` package to provide access to environment variables. Copy the example file into `.env` and use this file for any other environment variables the web component may require:

```
cp .env.example .env
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3011](http://localhost:3011) to view the web component test page in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Testing

Automated unit tests can be run via the `yarn test` command. These unit tests are written using the JavaScript testing framework `Jest` and make use of the tools provided by the [React Testing Library](https://testing-library.com/docs/). Automated accessibility testing for components is available via the `jest-axe` library. This can be achieved using the `haveNoViolations` matcher provided by `jest-axe`, although this does not guarantee that the tested components have no accessibility issues.

Integration testing is carried out via `cypress` and can be run using:

- `yarn exec cypress run` to run in the CLI
- `yarn exec cypress open` to run in the GUI

Currently, there are `cypress` tests for various aspects of the web component, such as running `python` and `HTML` code and Mission Zero-related functionality. These can be found in the `cypress/e2e` directory. Screenshots and videos related to any failures in the most recent test run can be found in `cypress/screenshots` and `cypress/videos` respectively.

## Usage

The editor web component can be included in a page using the `<editor-wc>` HTML element and a script tag pointing to the desired version of the web component (`https://editor-static.raspberrypi.org/releases/<version-number>/web-component.js`). The `editor-wc` tag accepts the following attributes:

- `code`: A preset blob of code to show in the editor pane (overrides content of `main.py`/`index.html`)
- `sense_hat_always_enabled`: Show the Astro Pi Sense HAT emulator on page load
- `load_remix_disabled`: Do not load a logged-in user's remixed version of the project specified by `identifier` even if one exists (defaults to `false`)
- `project_name_editable`: Allow the user to edit the project name in the project bar (defaults to `false`)
- `output_only`: Only display the output panel (defaults to `false`)
- `assets_identifier`: Load assets (not code) from this project identifier
- `output_panels`: Array of panel names to display (defaults to `["text", "visual"]`)
- `embedded`: Enable embedded mode which hides some functionality (defaults to `false`)
- `output_split_view`: Start with split view in output panel (defaults to `false`, i.e. tabbed view)

## Development

### Previewing

The web component test page at `http://localhost:3011` can be used to develop the web component in isolation if needed. This page is configured to pass query parameters into the web component as attributes (including `class`, `style` etc.), allowing the web component to be previewed in different states during development. For example, to preview the web component with the Sense HAT always showing, visit `http://localhost:3011/web-component.html?sense_hat_always_enabled=true`.

### Styling

There are several mechanisms that can be utilised to style part or all of the web component. Due to the nature of the web component, styles can either be applied to the web component itself or to the page that contains the web component.

#### Styling internally

Internal styles can be utilised and shared between the standalone editor and the web component. These styles are passed to the web component via the `style` attribute as a string and can be found in [`WebComponentProject.js`](LearnerExperience/editor-ui/src/components/WebComponent/Project/WebComponentProject.js) which uses [`InternalStyles.scss`](./src/components/WebComponent/InternalStyles.scss) and [`ExternalStyles.scss`](./src/components/WebComponent/ExternalStyles.scss) to style the web component.

Internal styles can be utilised due to a `--scale-factor` being set on font size and spacing variables and an update to the base font size being set at the appropriate size i.e. in [WebComponent.scss](./src/components/WebComponent/WebComponent.scss). This enables the use of the existing font and spacing variables as well as the `em` unit, allowing the web component to utilise the same definitions as the standalone editor.

**NB** due to `rem` using the `font-size` from the root it is unable to be overwritten in the shadow root so it should be avoided. Wherever possible use the existing calculations with the `--scale-factor` or `em` (however beware of nested relative sizing).

#### Styling externally

Styles from the parent application can be passed to the web component in a few different ways:

- The web component utilises a shadow DOM, this creates a shadow root element in the DOM which is separate from the main DOM. It does however copy and create a new DOM tree from the main DOM with all styles applied to the root in the main DOM available in the shadow root.

- A class can be applied to the custom element `wc-editor` which allows the parent application to style the web component container. This can be done by using the `class` attribute on the custom element. **NB** This attribute is `class` **NOT** `className`.

- Other styles from the parent application will not be inherited by the web component. However, the web component can be styled by the parent application by using the `::part` pseudo-element selector. This allows the parent application to style the web component by targeting the web component's shadow DOM. For example, the following CSS will style the web component's `#root` element (due to the part attribute definition in [web-component.js](./src/web-component.js)):

```scss
::part(editor-root) {
  // allows variables to be passed into the shadow dom
  @include sauce-theme-primary-vars();
  @include sauce-theme-secondary-vars();
  // allows you to set custom variables inside the shadow dom
  --editor-primary-theme: var(--theme-primary);
  --editor-secondary-theme: var(--theme-secondary);
  // background: var(--theme-secondary); // variables can then be applied inside the shadow dom
  // enables the parent application to control the size of the web components root element
  display: block;
  flex: 1 1 auto;
  max-block-size: 100dvh;
}
```

#### Instructions Styling

Classes from the stringified HTML passed to the web component in the `instructions` attribute are being used to style the project steps in the instructions panel.

##### Task Block

Styles for the task block can be applied as follows:

```html
<h2 class="c-project-heading--task">Task heading</h2>
<div class="c-project-task">{task content here}</div>
```

##### Callouts

There are three types of callout: tip, debugging and generic. The green tip callout is generated as follows:

```html
<div class="c-project-callout c-project-callout--tip">
  <h3>{Tip title}</h3>
  {tip content here}
</div>
```

The red debugging callout is generated as follows:

```html
<div class="c-project-callout c-project-callout--debug">
  <h3>{Debugging title}</h3>
  {debugging content here}
</div>
```

The blue generic callout is the default if no modifier is specifed:

```html
<div class="c-project-callout">{callout content here}</div>
```

##### Output

This class renders a bordered `div` with monospaced text that resembles Python output. Other font styles and images are not yet supported.

```html
<div class="c-project-output">{output content}</div>
```

#### Code snippets

Python code snippets are styled and syntax-highlighted using the `language-python` class:

```html
<code class="language-python">print('hello world')</code>
```

## Deployment

Deployment is managed through Github actions. The UI is deployed to staging and production environments through an S3 bucket, managed via Cloudflare. This requires the following environment variables to be set

- `AWS_ACCESS_KEY_ID`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_SECRET_ACCESS_KEY`

Other variables that pertain to the app, rather than its deployment, are set to default values in the [build-and-deploy workflow file](./.github/workflows/build-and-deploy.yml). These are also in `.env.example`.

The staging bucket is called [`editor-dist-staging`](https://dash.cloudflare.com/44a2049cd9f2b11d21474e06251367df/r2/default/buckets/editor-dist-staging), and the latest deployment of `main` can be previewed https://staging-editor-static.raspberrypi.org/branches/main/web-component.html. The staging bundle for use on the staging version of other sites is available at https://staging-editor-static.raspberrypi.org/branches/main/web-component.js.

The production bucket, [`edtior-dist`](https://dash.cloudflare.com/44a2049cd9f2b11d21474e06251367df/r2/default/buckets/editor-dist), contains the versioned releases of the web component that are used on other sites. Each release can be previewed at `https://editor-static.raspberrypi.org/releases/<version-number>/web-component.html`, and the bundle is available at `https://editor-static.raspberrypi.org/releases/<version-number>/web-component.js`.

### Review apps

The build for each PR is deployed to the same S3 bucket as staging, and can be previewed at `https://staging-editor-static.raspberrypi.org/branches/<PR-number>_merge/web-component.html`. The PR should get updated with the URL to the relevant directory of the host bucket, but `/web-component.html` may need to be appended to reach the preview.

### Release Process

A new release of `editor-ui` is created via following process:

1. Create a branch on Github for the release.
2. Update `CHANGELOG.md` with new version number and date in the list of changes under `Unreleased`.
3. At the bottom of `CHANGELOG.md`, add a link for the new version and update the `Unreleased` link to point to the latest version`…HEAD`.
4. Update the version number in `package.json` to the new version number.
5. Push these changes to the release branch on Github.
6. Create a PR on Github for the release branch and put the `CHANGELOG` diff for the new release in the description.
7. Get someone to approve the PR and then merge.
8. Within the releases tab, create a new tag with the version number of the new release with the target set to `main`.
9. Give the release the same name as the tag and paste the `CHANGELOG` diff in the description.
10. Set the release to be the latest release and publish 🚀
