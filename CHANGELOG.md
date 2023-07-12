# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `hex` attribute for `p5` `Color` class (#574)
- `hex_color` function for `py5`, including imported mode (#574)

### Fixed

- Color class attributes in `p5` (#574)
- Make `py5` imported mode sketches run when `run_sketch` is commented out (#574)
- Allow output text to be scrollable if overflow-y (#575)

## [0.16.3] - 2023-06-29

### Changed

- Update Beta Banner copy and add a link

## [0.16.2] - 2023-06-12

### Added

- New landing page

### Changed

- Move eslint config to `.eslintrc.json` with prettier support
- Add `.editorconfig`

### Fixed

## [0.16.1] - 2023-05-19

### Added

### Changed

### Fixed

- Sentry CORS errors (#523)

## [0.16.0] - 2023-05-18

### Added

- New colors (#474)
- New typography (#475, #513)
- Ability to create `HTML` and `CSS` files in a `HTML` project (#478)
- Help text in the new file modal (#478)
- Add dev-container support (#489)
- Add input/output responsiveness (#473)
- Ability to drag and drop input panel tabs (#438)
- Distinguish icon type (#470)
- Custom callback when Enter pressed in modals (#491)
- `GeneralModal` and `InputModal` to encapsulate the common modal behaviour (#491, #517)

### Changed

- Updated spacing variables to match the new design system (#460)
- Position run button in separate bar (#471)
- Color usage (#474)
- Handling of internal/external links for HTML/CSS projects (#483)
- Existing modals to use `GeneralModal` or `InputModal` (#491)
- Refactored login logic to make this available outside of the login button (#491)
- Turned off HTML autorun (#515)

### Fixed

- Modal button alignment support (#460)
- Storybook setup and dev deployment (#461)
- HTML auto-run functionality (#481)
- Updating Sentry to fix compile-time error (#487)
- Fix local package build process (#488)
- Color naming convention (#474)
- Fix Web App Manifest logos, colors, and titles (#446)
- Ability to run HTML projects by clicking run button (#481)
- Internal/external HTML project links (#521)

## [0.15.0] - 2023-04-27

### Added

- Initial storybook setup (#440)
- `NewFileModal` component (#450)
- Autofocus input when modal opened (#450)
- Submit form in modals when 'Enter' pressed (#450)

### Changed

- Projects tab layout (#447)
- Refactored `NewComponentButton` (#450)
- Modal styling (#450)

### Fixed

- Fix storybook build error (#484)
- CookieBot consent request in iframes (#437)
- Resetting name error if file creation/renaming is cancelled (#450)
- Mission Zero performance gains (#457)

## [0.15.0] - 2023-04-13

### Added

- Container queries (#445)
- Resize handle #453
- File type icons (#449)

## [0.14.0] - 2023-03-28

### Added

- Load project based on locale (#410, #425)
- Ability to recognise py5 magic comment (#412)
- Allow py5 imported mode not to need `run_sketch` (#417)
- Python blob and skulpt module for py5 imported mode (#414)
- Cypress tests for `py5` imported mode (#412, #414, #417, #426)

### Changed

- Updated privacy policy link to use the child friendly privacy policy (#397)
- Update URL structure to include locale (#407)
- Update Sentry configuration to allow distributed tracing (#411)
- Only persist project to `localStorage` if changed rather than on load (#410)
- Allow u13s accounts with additional parameters in userManager (#436)

### Fixed

- Fix language loading - i18n initialisation setup (#430)
- Fix keyboard navigation (#375)
- Reverted footer links back to underlined (#398)

### Removed

- Dependency on Sauce Design System (#418)

## [0.13.0] - 2023-03-02

### Added

- Added release notes to `README.md` (#354)
- Pagination on 'Your projects' page (#338)

### Changed

- Switched `processing` implementation from `p5.py` to `py5.py` (#364)
- Font size only scales code, text output and error messages rather than the whole UI (#365)
- Refactored font size settings to use React `ContextProvider` (#366)
- Clicking 'login to save' triggers save/remix after successful login (#368)
- Renaming project, adding new file or renaming file triggers autosave immediately (#368)
- Bump http-cache-semantics from 4.1.0 to 4.1.1 (#361)
- Removed redundant file indices (#377)
- Use GraphQL API to fetch project index page (#376)

### Fixed

- Make sure accessDeniedData login button redirects to /projects (#356)
- Allowed HTML projects to load (#362)
- Scrollbar flash on first load (#358)
- Scrollbar appearing in visual output (#358)
- Sense hat visual output height (#358)
- Web component font size (#358)
- Web component icon visibility (#358)
- Renaming project, adding new file or renaming file always triggers autosave (#368)
- Use `HtmlRunner` for `html` projects (#378)
- Accessibility Fixes (#373, #382, #383)
- Hide the codemirror `cm-widgetBuffer` (#384, #395)
- Height discrepancy of the tab containers (#385)

## [0.12.0] - 2023-01-27

### Changed

- Simplified the URL structure to replace project type (#347)
- Upgrade `react-router` to `v6`
- Bump json5 from 1.0.1 to 1.0.2 (#321)

### Fixed

- Show `p5` error messages in the user interface (#346)
- Get review apps working (#351)

## [0.11.0] - 2023-01-17

### Added

- Styling of the projects list (#317)
- Ability to collapse and expand the left hand file pane (#316)
- Plausible event tracking for left hand file pane (#325)
- Last updated field added to the projects table (#319)
- Message for empty state on projects (#327)
- Rename project action on project index page (#324)
- Context menu for project index page actions on mobile (#324)
- Danger button styling (#330)

### Changed

- Change port number to fix 'no consent token' error (#326)
- Long file names truncated rather than scrolling in left hand file pane (#316, #337)
- Tab scrollbars only appear when necessary (#331)
- Added merge=union gitattribute for this file (#339)

### Fixed

- Make sure button text is always centered (#328)
- Make theme and font size persist across all pages of the app (#329)
- Make dismissing the Beta banner persist across all pages of the app (#329)
- Touch area of icon-only buttons (#330, #336)
- Delete project action on project index page (#330)
- Refactored project list loading to allow loading states to be shown (#330)
- Removed unneeded scrollbars on the editor and output panels (#331)
- Make Your projects page background extend below the fold (#334)

## [0.10.0] - 2023-01-06

### Added

- Plausbile event tracking for login, remix, save and code run (#250)
- Message prompting users to login or save if they make non-autosaved changes (#291)
- Unit tests for the autosave trigger (#291)
- Project not found and access denied modals shown on project loading error (#298)
- Styling for small buttons (#303)
- Project page header and styling (#314)
- Ability to open and focus files from the left hand file pane (#301)
- Ability to close file tabs (#301)
- Validation to prevent file names containing spaces (#301)

## Changed

- Bump terser from 4.8.0 to 4.8.1 (#143)
- Updated buttons and tabs styling (#296)
- Updated icons (#296)
- Bump engine.io from 6.2.0 to 6.2.1 (#272)
- Increased clickable area for tabs (#299)
- Bump decode-uri-component from 0.2.0 to 0.2.2 (#295)
- File tab bar scrolls rather than wraps (#301)
- Long file names no longer wrap in tab bar (#301)

### Fixed

- Moved `FileMenu` click handler to `MenuItem` for better keyboard support (#300)
- Touch target size on button to open file context menu (#301)

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

[unreleased]: https://github.com/RaspberryPiFoundation/editor-ui/compare/v0.16.1...HEAD
[0.16.1]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.16.1
[0.16.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.16.0
[0.15.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.15.0
[0.14.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.14.0
[0.13.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.13.0
[0.12.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.12.0
[0.11.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.11.0
[0.10.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.10.0
[0.9.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.9.0
[0.8.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.8.0
[0.7.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.7.0
[0.6.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.6.0
[0.5.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.5.0
[0.4.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.4.0
[0.3.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.3.0
[0.2.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.2.0
[0.1.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.1.0
