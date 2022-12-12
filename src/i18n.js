import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      en: {
        translation: {
          // here we will place our translations...
          betaBanner: {
            message: 'The Code Editor is in beta.',
            modal: {
              close: 'Close',
              heading: 'Code Editor is in beta',
              meaningHeading: 'What does beta mean?',
              meaningText: 'Beta means that we are not quite finished yet, and some things might not look or work as well as we’d like. However, it also means you are one of the first people to use our new Code Editor!',
              whatNextHeading: 'What next?',
              whatNextText: 'We\'ll soon be asking for your feedback, so we can work on making it better for you, and other digital makers.',
            },
            modalLink: 'What does this mean?'
          },
          filePane: {
            errors: {
              generalError: 'Error',
              notUnique: 'File names must be unique.',
              or: 'or',
              unsupportedExtension: 'File names must end in {{allowedExtensions}}.'
            },
            files: 'Project files',
            images: 'Image gallery',
            newFileButton: 'Add file',
            newFileModal: {
              cancel: 'Cancel',
              heading: 'Add a new file to your project',
              inputLabel: 'Name your file',
              save: 'Save',
            },
            renameFileModal: {
              cancel: 'Cancel',
              heading: 'Rename file',
              inputLabel: 'Name your file',
              save: 'Save'
            },
            fileMenu: {
              renameItem: 'Rename file'
            }
          },
          footer: {
            accessibility: 'Accessibility',
            charityNameAndNumber: 'Raspberry Pi Foundation UK registered charity 1129409',
            cookies: 'Cookies',
            privacy: 'Privacy',
            safeguarding: 'Safeguarding',
          },
          globalNav: {
            accountMenu: {
              login: 'Login',
              logout: 'Logout',
              profile: 'My profile',
              projects: 'My projects',
            },
            accountMenuDefaultAltText: 'Account menu',
            accountMenuProfileAltText: '{{name}}\'s account',
            raspberryPiLogoAltText: 'Raspberry Pi logo'
          },
          header: {
            autoSaving: 'Saving',
            autoSaved: 'Saved',
            download: 'Download',
            downloadFileNameDefault: 'my {{project_type}} project',
            editorLogoAltText: 'Editor logo',
            newProject: 'New Project',
            projects: 'Your projects',
            save: 'Save',
            settings: 'Settings',
            settingsMenu: {
              heading: 'Settings',
              textSize: 'Text Size',
              textSizeOptions: {
                large: 'Large',
                medium: 'Medium',
                small: 'Small',
              },
              theme: 'Colour Mode',
              themeOptions: {
                dark: 'Dark',
                light: 'Light'
              },
            },
          },
          loginToSaveModal: {
            cancel: 'Cancel',
            downloadButtonText: 'Download',
            downloadText: 'Or you can download your project and save it on your computer.',
            heading: 'Save your project',
            loginButtonText: 'Log in to save',
            loginText: 'Log in to your Raspberry Pi account to save your work, and you\'ll be able to access and edit your project whenever you need to.'
          },
          notifications: {
            projectRemixed: 'Your remixed project has been saved',
            projectSaved: 'Your project has been saved'
          },
          output: {
            errors: {
              interrupted: 'Execution interrupted',
            },
            senseHat: {
              controls: {
                colour: 'colour',
                humidity: 'humidity',
                motion: 'motion',
                motionSensorOptions: {
                  no: 'No',
                  yes: 'Yes',
                },
                name: 'Space Station Control Panel',
                pressure: 'pressure',
                temperature: 'temperature',
                timer: 'timer',
              },
              model: {
                pitch: 'pitch',
                roll: 'roll',
                yaw: 'yaw',
              },
            },
            textOutput: 'Text Output',
            visualOutput: 'Visual Output',
          },
          project: {
            accessDeniedNoAuthModal: {
              heading: 'You are not able to see this project',
              loginButtonText: 'Log in to your account',
              newProject: 'Create a new code project',
              projectsSiteLinkText: 'Explore project site',
              text: 'If this is your project, log in to see it. If this is not your project you can visit the project site for cool project ideas or start coding in a new project.',
            },
            accessDeniedWithAuthModal: {
              heading: 'You can\'t access this project',
              newProject: 'Create a new code project',
              projectsSiteLinkText: 'Explore project site',
              text: 'Visit the project site for cool project ideas or start coding in a new project.',
            },
            loading: 'Loading',
            notFoundModal: {
              heading: 'This project does not exist',
              newProject: 'Start new code project',
              projectsSiteLinkText: 'Explore project site',
              text: 'You can start coding in a new project, or visit the project site for cool project ideas.'
            },
            untitled: 'Untitled project'
          },
          runButton: {
            run: 'Run',
            stop: 'Stop',
            stopping: 'Stopping...',
          },
        }
      }
    }
  });

export default i18n;
