# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- Add `project_name_editable` attribute to web component (#1009)

### Changed

- Remove unused `/embedded/projects/:identifier` route (#1013)

### Fixed

- Remove unused `REACT_APP_LOGIN_ENABLED` env var (#1006)
- Fix infinite remix loop when `BYPASS_AUTH` set in `editor-api` (#1007)
- Fixes for docker-compose.yml (#1008)
- Fix deprecation warnings in GitHub Actions (#1011)
- Removed unused `isEmbedded` param from `useProject` call in `EmbeddedViewer` (#1016)
- Improvements to Cypress specs in CI (#1017)
- Fix warnings and verbose output when starting Webpack Dev Server (#1018)

## [0.23.0] - 2024-05-09

### Added

- Support to enable embedding iframes in HTML projects from in-house domains (#985)
- Dispatch event when project identifier changes, e.g. after project is remixed (#2830)
- Add `load_remix_disabled` attribute to web component (#992)

### Changed

- Invalidate cached project when project is remixed (#1003)

### Fixed

- Unit tests for `pyodide` runner (#976)
- Remove broken `format` script (#991)

## [0.22.2] - 2024-03-18

### Added

- Ability to use `page` query parameter in the embedded viewer when not a browser preview (#958)
- ASSETS_URL env var to allow assets to be served from R2 bucket
- `webpackDevServer` allowed headers for Astro Pi (#967)
- Tests for the `PyodideWorker` (#981)

### Changed

- Make the save prompt in web component optional, defaulting to not showing (#965)

### Fixed

- Page crashing when toggling between projects (#946)
- Get `pyodide` working in the web component (#945)
- Allow `pygal` `chart.add` function to take single values as well as an array (#954)
- Editor losing focus when project changes (#959)
- Fix preview link (#912)
- Web component code attribute (#963)
- Web component dark mode (#964)
- Fix substring match on CSS images (#910)
- Error message wrapping (#968)
- Fix scrollbars not showing (#816)
- Width of empty `p5` canvas (#969)
- Scrolling `pygal` output in `pyodide` (#969)
- Light/dark mode theming updates (#972)

## [0.22.1] - 2024-02-23

### Fixed

- HTMLRunner images - add crossorigin attribute to iframe imgs (#927)
- Fix HTML indentation (#928)
- Pyodide input function (#935)
- Loading imports from multiple files with `pyodide` (#941)

## [0.22.0] - 2024-02-22

### Added

- Add a Pyodide runner (#893)

### Changed

- Made `p5` canvas responsive to the available space (#887)
- Specify the 'roles' scope in OAuth requests

### Fixed

- Local docker setup with yarn v3 (#905)
- Part of Stylelint issues: duplicates, logical properties (#916)
- Text output wrapping on Firefox (#922)

## [0.21.2] - 2024-01-23

### Changed

- Minor copy changes to HTML add file modal
- Toggle errors sent via apiCallHandler off (#890)
- Upgrade webpack-dev-server to 4.0.0 to support conditional headers
- Upgrade yarn to 3.4.1 to workaround a string-width issue
- Improved file structure as part of the linter update (#926)
- Add a ?pyodide=true flag for python project pages

### Fixed

- Editor input not focussing on iPad (#898)

### Fixed

- Sidebar selected option styling (#886)

## [0.21.1] - 2024-01-11

### Added

- Download panel save button (#872)

### Changed

- Stack editor input and output panels based on container width (#869)
- Blob/URL replacement in HTMLRunner (#877)

### Fixed

- Boolean web component attributes (#881)
- Wrap the project bar when sidebar is wide (#869)
- Web component project bar state update delay (#869)
- Left border of the project bar (#869)
- Indentation of code block first line (#883)
- Code block 3-digit line numbers (#883)

## [0.21.0] - 2024-01-05

### Added

- Load remix functionality (#804)
- ProjectBar functionality in the web component (#799)
- WebComponent can receive style strings from host app (#811)
- Quiz rendering in InstructionsPanel (#777)
- Styling for the task section of the instructions (#781)
- Styling for the instructions callouts (#788)
- Output styles for Instructions (#790, #807)
- Styling for the instructions code snippets (#795)
- Styling for the instructions code blocks (#794, #808)
- quizReady custom event (#812)
- Code snippet and code block syntax highlighting for HTML and CSS in the instructions (#824)
- Toast save reminder to web component (#822)
- ProgressBar and completion-handling on quizzes (#834)
- Support for multiple host styles in the web component (#863)

### Changed

- Untangle HTML runner (#876)
- Project sidebar mobile structure and default to instructions behaviour (#823)
- Auth web component from user in local storage (#852)
- Save and download panel copy (#784)
- Application of styles in the web component to remove `sass-to-string` (#788)
- Info panel links open in a new tab (#803)
- Copy updates (#803)
- Restyling the instructions progress bar (#808)

## Fixed

- Standalone editor height (#864)
- Web component height on Firefox (#838)
- Web component resizable handle errors & sidebar width (#806)
- HTML projects loading in web component (#789)
- Enabled modals in the web component (#802)
- Context menu styling in the web component (#819)
- Collect web component login data (#818)
- Syntax highlighting contrast in dark mode (#824)
- Secondary button theming (#827)
- Instructions step buttons hit area (#827)
- Instructions code block line highlighting (#827)
- Instructions image widths (#827)
- Save status spacing (#827)
- Disappearing borders on tablet (#827)
- Dark mode button theming (#850)
- `<strong>` styling on Firefox (#854)
- Progress bar width on Firefox (#855)
- Instructions blocks spacing (#856)
- Font family stacking (#857)
- Save/download panel spacing (#859)
- Instructions output wrapping in Firefox (#862)
- Instructions code blocks with no line numbers (#863)
- New file button width (#865)

## [0.20.0] - 2023-11-24

### Added

- Logical properties linter rule (#770)
- Added download panel for sidebar (#744)
- Javascript support for HTML projects (#748)
- DownloadPanel for sidebar (#744)
- Custom events for Log In and Sign Up from DownloadPanel (#744)
- SVGO config file (#720)
- Added ability to enable sidebar in web component (#738)
- Added ability to customise sidebar options (#738)
- Instructions Panel for the sidebar (#751, #768)
- Added ability to fix the theme in the web component (#757)
- Added ability to increase font size in the web component (#757)
- Instructions table styling (#858)

### Changed

- Web component theming (#766)
- Replace physical properties with logical values - padding (#774)
- Sidebar - Refactored styles to be closer to designs (#720)
- Sidebar - Refactored theming to fix inconsistencies between themes (#720)
- Sidebar - Added hover styles to collapse and close buttons (#720)
- Sidebar - Option/Tab style (#720)
- Stopped SVGO from removing icon (svg) viewBoxes (#720)
- Move local development port to avoid projects-ui clash (#736)
- Update design-system-react dependency to publicly available version
- Storybook SVG loader added and store configured (#749)
- Switched `FontSizeSelector` and `ThemeToggle` over to using the new `SelectButtons` (#757)
- Download panel removes log-in prompts for logged-in users (#744)

### Fixed

- Correct download.svg replaces DownloadIcon component (#793)
- Container rather than media query breakpoints for the web component (#776)
- `FileMenu` alignment (#720)
- Edit icon not showing in ContextMenu (#720)
- Updated sidebar and file icons to correct size (#720)
- Local docker setup for development (#739)
- Editor height overflow (#771, #779)

## [0.19.4] - 2023-11-08

### Changed

- Added p5 library that can access WebComponent shadowRoot (#731)
- Allow external rpf.io links (#729)

## [0.19.3] - 2023-10-25

### Added

- `stepChanged` custom event for the web component (#709)
- Web component tests (#709, #710)
- `instructions` attribute for the web component (#712)
- Instructions slice to store data passed from the Projects site (#712)
- Adding auth to the web component (#728)
- Allow web component to load, save and remix projects (#728)

### Changed

- Replace physical properties with logical values - margin (#717)
- Replace physical properties with logical values - position (#699)
- Moved web component custom events from the `editor-wc` element to the `document` (#710)
- Renamed web component custom events to be prefixed with `editor-` (#710)
- Switch props of `WebComponentLoader` from `snake_case` to `camelCase` (#712)

### Fixed

- Clipped icon in "Save your work" toast (#707)
- Hydra logout flow to delete session (#714)

## [0.19.2] - 2023-10-12

### Fixed

- TIDY UP: Improve component structure (#692)
- TIDY UP: Naming convention (#688)
- Style scaling to support integration into products with difffernt... (#687)
- Boosting Performance: React.js Code Optimizations (#686)
- Fix useEffect web component warnings (#674)

## [0.19.1] - 2023-10-04

### Changed

- Performance enhancements on app routes & sense hat transitions (#686)
- Web component styling (#687)
- Convert React components to JSX files (#688)
- Moved `svg`s to `/src/assets/icons` (#692)
- Moved `scss` files to `/src/stylesheets` (#692)
- Moved slices and reducers to `/src/redux` (#692)
- Moved loaders to `/src/containers` (#692)

### Fixed

- Min-height on Sense HAT model to fix tablet-view (#658)
- Tidied up stylesheets (#684)

## [0.19.0] - 2023-09-25

### Added

- Mobile project details component (#616)
- Mobile navigation between code and output (#615)

### Changed

- Position of run button on mobile (#615)
- Save button styles (#633)
- Tweak tab colors (#634)
- Dyanmic viewport height (#627)
- Split and tabbed view button styles (#645)
- Restyled tabs (#650)

### Fixed

- Mobile sidebar fixes (#644)
- Sidebar scroll behaviour (#631, #662)
- Fix docker build (#643)
- Fix mobile projects page scrolling (#662)
- Fix "Your projects" button on review apps (#666)
- Code continues to run when mobile sidebar opened (#667)

## [0.18.2] - 2023-08-29

### Changed

- Error capturing for python project fires to editor-api rather than Sentry (#625)

## [0.18.1] - 2023-08-03

### Fixed

- Fix list of the projects (#614)

### Changed

- Plausible goals for starting, downloading and interacting with a project (#606)

## [0.18.0] - 2023-08-02

### Added

- Sidebar settings (#585)
- Sidebar info (#566)
- Add Projects Panel to sidebar (#564)

### Fixed

- Minor fixes to the sidebar layout (#602)
- Fixed text wrap in the files section of the Sidebar (#596)

### Changed

- LandingPage and ProjectBar's Save buttons use design-system-react (#579)
- Update colors for buttons (#579)

## [0.17.1] - 2023-07-25

### Fixed

- Safari minor style fixes

## [0.17.0] - 2023-07-24

### Added

- New landing page (#531)
- Ability to specify project name and type on creation (#519)
- Ability to view HTML preview output in separate window (#536)
- `hex` attribute for `p5` `Color` class (#574)
- `hex_color` function for `py5`, including imported mode (#574)
- New landing page (#531)
- Ability to specify project name and type on creation (#519)
- Ability to view HTML preview output in separate window (#536)

### Changed

- Refactored `Header` into new `ProjectBar` component and moved to same level as sidebar (#532)
- `Sidebar` restyling and refactor to better support multiple panels (#501)
- Refactored and restyled project files panel and removed project images (#501)
- Moved project images into own sidebar panel (#567)
- Fix to close `Add File` modal when `Enter` is pressed and file is valid (#509)
- Move eslint config to `.eslintrc.json` with prettier support (#502)
- Add `.editorconfig` (#502)
- Default HTML project improvement (#543)
- Update Beta Banner copy and add a link (#550)

### Changed

- Refactored `Header` into new `ProjectBar` component and moved to same level as sidebar (#532)
- `Sidebar` restyling and refactor to better support multiple panels (#501)
- Refactored and restyled project files panel and removed project images (#501)
- Moved project images into own sidebar panel (#567)
- Fix to close `Add File` modal when `Enter` is pressed and file is valid (#509)
- Move eslint config to `.eslintrc.json` with prettier support (#502)
- Add `.editorconfig` (#502)
- Default HTML project improvement (#543)
- Update Beta Banner copy and add a link (#550)

### Fixed

- HTML/CSS minor fixes (#594)
- Color class attributes in `p5` (#574)
- Make `py5` imported mode sketches run when `run_sketch` is commented out (#574)
- Allow output text to be scrollable if overflow-y (#575)
- No longer renders a blank page on 401, 403 & 404 for embedded viewer (#534)
- Input modal help text styling in light mode (#519)
- Propagation of key press events in modals (#519)
- Keyboard accessibility of project file opening (#501)
- Quick fix for Editor header on mobile # (#551)
- Landing page design review comments (#560)

### Changed

- Update Beta Banner copy and add a link (#550)
- Move eslint config to `.eslintrc.json` with prettier support (#502)
- Add `.editorconfig` (#502)
- Default HTML project improvement (#543)

## [0.16.1] - 2023-05-19

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

[unreleased]: https://github.com/RaspberryPiFoundation/editor-ui/compare/v0.23.0...HEAD
[0.23.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.23.0
[0.22.2]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.22.2
[0.22.1]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.22.1
[0.22.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.22.0
[0.21.2]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.21.2
[0.21.1]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.21.1
[0.21.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.21.0
[0.20.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.20.0
[0.19.4]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.19.4
[0.19.3]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.19.3
[0.19.2]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.19.2
[0.19.1]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.19.1
[0.19.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.19.0
[0.18.2]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.18.2
[0.18.1]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.18.1
[0.18.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.18.0
[0.17.1]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.17.1
[0.17.0]: https://github.com/RaspberryPiFoundation/editor-ui/releases/tag/v0.17.0
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
