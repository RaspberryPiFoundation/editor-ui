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
          filePane: {
            errors: {
              generalError: 'Error',
              notUnique: 'File names must be unique.',
              or: 'or',
              unsupportedExtension: 'File names must end in {{allowedExtensions}}.'
            },
            files: 'Project Files',
            images: 'Image Gallery',
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
              renameItem: 'Rename File'
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
            download: 'Download',
            downloadFileNameDefault: 'my {{project_type}} project',
            editorLogoAltText: 'Editor logo',
            newProject: 'New Project',
            projects: 'My Projects',
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
