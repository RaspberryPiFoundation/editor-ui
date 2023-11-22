# editor-standalone

Currently WIP but the basic idea is to separate out the editor standalone website and the core functionality in the web component. This is currently used in other projects and will enable the current editor-ui to separate out the complexity and duality that currently exists.

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Environment variables

The app uses the `dotenv` package to provide access to environment variables.
Copy the example files into the correct place:

```
cp .env.example .env
```

## Testing

Automated unit tests can be run via the `yarn test` command. These unit tests are written using the JavaScript testing framework `Jest` and make use of the tools provided by the [React Testing Library](https://testing-library.com/docs/). Automated accessibility testing for components is available via the `jest-axe` library. This can be achieved using the `haveNoViolations` matcher provided by `jest-axe`, although this does not guarantee that the tested components have no accessibility issues.

Integration testing is carried out via `cypress` and can be run using the `yarn exec cypress run` commmand. Currently, there are basic `cypress` tests for the standalone editor site functionality. These can be found in the `cypress/e2e` directory. Screenshots and videos related to the most recent `cypress` test run can be found in `cypress/screenshots` and `cypress/videos` respectively.
