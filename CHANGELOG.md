# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0]

### Added
- Option to specify that the visual output tab should be present on page load via a query string, otherwise only the text output is present (#182)
- Automatically add and switch focus to the visual output tab when a visual library is imported during the code run (#182)

### Changed
- Update styling of embedded player to stack the visual and text output (#182, #187)
- Update styling on the `sense_hat` visual output (#174)
- Update build workflow with a reusable job to update preview, staging, and prod (#176)
- Change deployment to use specific AWS endpoint, and deploy releases to `/releases/...` and branches to `/branches/..` (#177)

### Fixed
- Stop button contrast in dark mode (#182)
- Surfacing errors promptly when stopping `p5` code runs (#182)
- `ESLint` (#175) and `stylelint` (#178) errors

## [0.3.0]

### Added
- Give the web component the option to enable the senseHAT on page load (#173)
- Add logo, and sidebar with menus (#167)
- Add a readColour param to the runComplete event. (#153)
- Add CORS headers to Webpack Dev Server (#152)
- Save a user's code when they log in (#142)

### Changed
- Versioned deployments of the UI (#140)
- Fix up eslint linting errors (#175)
- Use nginx buildpack on heroku instead of nodejs (#156, #166)
- Use the `PUBLIC_URL` env var to set URLs for the various bundles, shims, replacing `REACT_APP_S3_BUCKET` to allow assets to be served from sub directories in our S3 bucket. (#154)
- Style of the editor pane #145

### Fixed
- Made "stopping" button only appear after 100ms timeout to stop it flashing (#172)
- Fix input span disabling in webcomponent (#172)
- Fix syntax highlight colours in codemirror 6 (#134)

## [0.2.0]

### Added
- Mission Zero handover docs (#128)
- S3 deployment GH action

### Changed
- Upgrade to CodeMirror 6 (#131, #133)

### Fixed
- Whitespace handling in Firefox (#132)
- Stopwatch hook so PythonRunner doesn't get stuck resetting timer (e7b747053)

## [0.1.0]

### Added
- Events in Web Component indicating whether Mission Zero criteria have been met (#113)

[Unreleased]: https://github.com/RaspberryPiFoundation/editor-ui/compare/v0.4.0...HEAD
[0.1.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.1.0
[0.2.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.2.0
[0.3.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.3.0
[0.4.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.4.0

