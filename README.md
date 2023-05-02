# Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) but the app has been ejected so build scripts etc. are all in the repo now.

## Environment variables

The app uses the `dotenv` package to provide access to environment variables.
Copy the example files into the correct place:

```
cp .env.example .env

cp .env.webcomponent.example .env.webcomponent
```

Variables for the web application need to go into the `.env` file.
Variables for the web component can be placed in `.env.webcomponent`.


## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn package-install`

Needs running when the package.json is changed to ensure docker is using the latest packages. Run `yarn start` after to start the updated container.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Testing

Automated unit tests can be run via the `yarn test` command. These unit tests are written using the JavaScript testing framework `Jest` and make use of the tools provided by the [React Testing Library](https://testing-library.com/docs/). Automated accessibility testing for components is available via the `jest-axe` library. This can be achieved using the `haveNoViolations` matcher provided by `jest-axe`, although this does not guarantee that the tested components have no accessibility issues.

Integration testing is carried out via `cypress` and can be run using the `yarn exec cypress run` commmand. Currently, there are basic `cypress` tests for the standalone editor site, the web component and Mission Zero-related functionality. These can be found in the `cypress/e2e` directory. Screenshots and videos related to the most recent `cypress` test run can be found in `cypress/screenshots` and `cypress/videos` respectively.

## Web Component

The repo includes the Editor Web Component which shares components with the editor application but has a separate build process.

### Embedding

The web component can be included in a page by using the `<editor-wc>` HTML element.  It takes the following attributes

* `code`: A preset blob of code to show in the editor pane.
* `sense_hat_always_enabled`: Show the Astro Pi Sense HAT emulator on page load

### `yarn start:wc`

Runs the web component in development mode.  Open [http://localhost:3001](http://localhost:3001) to view it in the browser.

**NB** You need to have the main `yarn start` process running too.

It is possible to add query strings to control how the web component is configured.  Any HTML attribute can be set on the query string, including `class`, `style` etc.

For example, to load the page with the Sense Hat always showing, add [`?sense_hat_always_enabled` to the URL](http://localhost:3001?sense_hat_always_enabled)

## Deployment

Deployment is managed through Github actions.  The UI is deployed to staging and production environments via an S3 bucket.  This requires the following environment variables to be set

* `AWS_ACCESS_KEY_ID`
* `AWS_REGION`
* `AWS_S3_BUCKET`
* `AWS_SECRET_ACCESS_KEY`

Other variables that pertain to the app, rather than its deployment are set with defaults in the [build-and-deploy workflow](./.github/workflows/build-and-deploy.yml).  These are also in `.env.example`.

### Review apps

Currently the build is deployed to both S3 and Heroku.  The PR should get updated with the Heroku URL, and the web component demo is at `/web-component.html` on the Heroku review app domain.

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
10. Set the release to be the latest release and publish.
11. Go to Cloudflare and under `Workers > KV` select `editor` and change the `production-ref` to `releases/<new_version_number>`.
12. Go to `editor.raspberrypi.org` to see the new changes on production... 🚀
