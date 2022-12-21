# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Plausbile event tracking for login, remix, save and code run (#250)
- Message prompting users to login or save if they make non-autosaved changes (#291)
- Unit tests for the autosave trigger (#291)
- Project not found and access denied modals shown on project loading error (#298)

## Changed

- Bump terser from 4.8.0 to 4.8.1 (#143)
- Updated buttons and tabs styling (#296)
- Updated icons (#296)

## [0.9.0]

### Added

- Beta banner and modal (#266)
- Autosave icons and status (#268)
- Autosave project to database if user logged in and owns project (#270)
- Autosave project changes to local storage if user not logged in or does not own project (#270)
- Modal to prompt login or download if save button clicked when not logged in (#276)
- Ability to rename any project (#284)

## Changed

- Refactor API thunks and save logic (#268)
- Removed file menu for `main.py` (#269)
- Refactored project saving (#270), loading (#270) and remixing (#276) into redux asynchronous thunks
- Creates remix if save button clicked when logged-in user does not own project (#276)
- Send user access token with requests to load a project from the API (#280)
- Redirect users to the home page when they log out (#280)
- Trigger project reloading when the user changes (#280)
- Removed remix functionality from project name (#284)
- Flow for renaming the project (#284)
- Updated icons (#285, #294)
- Updated colours to match new palette (#294)

## Fixed

- Contrast on file menu hover in dark mode (#269)
- Stylelint errors (#269)
- Copy changes (#269)

## [0.8.0]

### Added

- Copyright and contributing documentation (#207)
- Errors when running code now include the name of the file in which the error occurred (#239)
- Sentry integration (#252)
- Ability to download a project (#255)
- FileMenu dropdown (#139)
- Confimatory message when a project has been saved (#262)

### Changed

- Switch wrapping in the editor to horizontal scrolling for long lines (#242)
- Replaced hard-coded text with translatable strings (#253)
- Launch rename modal via redux (#139)

### Fixed
- Allow users to save their code as anew project from the root page when logged in (#259)
- Stop users renaming `main.py` (#203)
- Style fixes on the 'My Projects' page (#265)
- Remove project name, download and save buttons from the header on the 'My Projects' page and when project is still loading (#265)

## [0.7.0]

### Changed

- Set indentation to 4 spaces to match PEP8 standard (#246)
- Update Github workflow not to strip dots from the git ref, and remove test dependency for main and ref deploys (#244, #248)

## [0.6.0]

### Added

- Github action for checking if changelog updated (#189)
- The web component `runCompleted` event now returns `duration: null` if the host page's tab loses focus during the code run (#192)
- Global nav on editor site with link to `raspberrypi.org` and account menu (#195)
- Footer on editor site with links to Privacy, Cookies, Accessibility and Safeguarding policies (#200)
- Cookie banner on the editor site (#206) but not in the embedded viewer (#231)
- Unit tests for login button and 'useProject' hook (#211)
- Script for Google Tag Manager to be used on the standalone editor site (#225)
- Ability to switch between split and tabbed output views on the editor site and in the web component (#234)
- Indentation markers in the editor (#237)

### Changed

- Upgraded to Jest 29 (#211)
- Updated Editor site title and logo (#220)
- Updated Codemirror and related dependencies to their latest versions (#221)
- Update build process to strip non-alphanumeric characters from the branch name (#222)

### Fixed

- Styling of Astro Pi orientation reset button on editor site (#202)
- Updated text output font to display emojis correctly (#221)

## [0.5.0]

### Added

- Functionality for renaming a file (#193)
- Styling for a secondary button (#193)

### Changed

- Layout and spacing in the Mission Zero Control Panel so web component fits in a narrower container (#191)
- Updated modal styling (#193)

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

[Unreleased]: https://github.com/RaspberryPiFoundation/editor-ui/compare/v0.9.0...HEAD
[0.1.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.1.0
[0.2.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.2.0
[0.3.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.3.0
[0.4.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.4.0
[0.5.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.5.0
[0.6.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.6.0
[0.7.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.7.0
[0.8.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.8.0
[0.9.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.9.0
