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

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Web Component

The repo includes the Editor Web Component which shares components with the editor application but has a separate build process.

### `yarn stat:wc`

Runs the web component in development mode.
Open [http://localhost:9000](http://localhost:9000) to view it in the browser.

There is no production build setup for the web component at present.

