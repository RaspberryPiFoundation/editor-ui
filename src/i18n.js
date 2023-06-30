import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

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
    fallbackLng: "en",
    locales: [
      "en",
      "ar-SA",
      "ca-ES",
      "cs-CZ",
      "me-ME",
      "cy-GB",
      "da-DK",
      "de-DE",
      "el-GR",
      "et-EE",
      "es-ES",
      "es-LA",
      "fr-FR",
      "he-IL",
      "hi-IN",
      "hr-HR",
      "it-IT",
      "ja-JP",
      "kn-IN",
      "ko-KR",
      "mr-IN",
      "hu-HU",
      "nl-NL",
      "no-NO",
      "pl-PL",
      "pt-BR",
      "pt-PT",
      "ro-RO",
      "ru-RU",
      "sk-SK",
      "sl-SI",
      "fi-FI",
      "sv-SE",
      "vls-BE",
      "sr-SP",
      "tr-TR",
      "uk-UA",
      "zh-CN",
      "zh-TW",
    ],
    // currently supportedLngs is the same as locales but clever lang loading
    // could reduce the number of supported translation files e.g. 'fr' over 'fr-FR' + variants
    supportedLngs: [
      "en",
      "ar-SA",
      "ca-ES",
      "cs-CZ",
      "me-ME",
      "cy-GB",
      "da-DK",
      "de-DE",
      "el-GR",
      "et-EE",
      "es-ES",
      "es-LA",
      "fr-FR",
      "he-IL",
      "hi-IN",
      "hr-HR",
      "it-IT",
      "ja-JP",
      "kn-IN",
      "ko-KR",
      "mr-IN",
      "hu-HU",
      "nl-NL",
      "no-NO",
      "pl-PL",
      "pt-BR",
      "pt-PT",
      "ro-RO",
      "ru-RU",
      "sk-SK",
      "sl-SI",
      "fi-FI",
      "sv-SE",
      "vls-BE",
      "sr-SP",
      "tr-TR",
      "uk-UA",
      "zh-CN",
      "zh-TW",
    ],
    load: "currentOnly", // otherwise for fr-FR it's load ['fr-FR', 'fr']

    // nonExplicitSupportedLngs: true, // allows locale variants on supportedLngs
    detection: {
      order: ["path"], // only use path to detect local for now
    },

    interpolation: {
      escapeValue: false, // not needed for react!!
    },
    resources: {
      en: {
        translation: {
          // here we will place our translations...
          modal: {
            close: "Close",
            error: {
              heading: "An error has occurred",
              externalLink: {
                message:
                  "Unfortunately links to external sites are not available in the Editor.",
              },
            },
          },
          betaBanner: {
            buttonLabel: "close",
            buttonTitle: "close",
            message: "The Code Editor is in",
            feedbackText: "Give us your",
            feedback: "feedback",
            feedbackImprove: "to help us improve.",
            modal: {
              close: "Close",
              heading: "Code Editor is in beta",
              meaningHeading: "What does beta mean?",
              meaningText:
                "Beta means that we are not quite finished yet, and some things might not look or work as well as we’d like. However, it also means you are one of the first people to use our new Code Editor!",
            },
            modalLink: "beta",
          },
          editorPanel: {
            ariaLabel: "editor text input",
          },
          filePane: {
            errors: {
              containsSpaces: "File names must not contain spaces.",
              generalError: "Error",
              notUnique: "File names must be unique.",
              or: "or",
              unsupportedExtension:
                "File names must end in {{allowedExtensions}}.",
            },
            files: "Project files",
            images: "Image gallery",
            newFileButton: "Add file",
            newFileq: {
              cancel: "Cancel",
              heading: "Add a new file to your project",
              helpText:
                "Remember to add the file extension at the end of your file name, for example, {{examples}}",
              helpTextExample: {
                html: "'file.html' or 'file.css'",
                python: "'file.py'",
              },
              inputLabel: "Name your file",
              addFile: "Add file",
            },
            renameFileModal: {
              cancel: "Cancel",
              heading: "Rename file",
              inputLabel: "Name your file",
              save: "Save",
            },
            fileMenu: {
              label: "Open file menu",
              renameItem: "Rename file",
            },
          },
          landingPage: {
            title: "Code Editor",
            subtitle: "Start coding, no setup required!",
            python: "Start coding Python",
            html: "Start coding HTML/CSS",
            login: "Login",
            start: "Not sure where to start?",
            projectPython: "Python path",
            projectHtml: "Web path",
          },
          footer: {
            accessibility: "Accessibility",
            charityNameAndNumber:
              "Raspberry Pi Foundation UK registered charity 1129409",
            cookies: "Cookies",
            privacy: "Privacy",
            safeguarding: "Safeguarding",
          },
          globalNav: {
            accountMenu: {
              login: "Log in",
              logout: "Log out",
              profile: "My profile",
              projects: "My projects",
            },
            accountMenuDefaultAltText: "Account menu",
            accountMenuProfileAltText: "{{name}}'s account",
            raspberryPiLogoAltText: "Raspberry Pi logo",
          },
          header: {
            autoSaving: "Saving",
            autoSaved: "Saved",
            buttonLabel: "Edit project name",
            buttonTitle: "Edit project name",
            download: "Download",
            downloadFileNameDefault: "my {{project_type}} project",
            editorLogoAltText: "Editor logo",
            newProject: "New Project",
            projects: "Your projects",
            save: "Save",
            settings: "Settings",
            settingsMenu: {
              heading: "Settings",
              textSize: "Text Size",
              textSizeOptions: {
                large: "Large",
                medium: "Medium",
                small: "Small",
              },
              theme: "Colour Mode",
              themeOptions: {
                dark: "Dark",
                light: "Light",
              },
            },
          },
          input: {
            comment: {
              py5: "Py5: imported mode",
            },
          },
          loginToSaveModal: {
            cancel: "Cancel",
            downloadButtonText: "Download",
            downloadText:
              "Or you can download your project and save it on your computer.",
            heading: "Save your project",
            loginButtonText: "Log in to save",
            loginText:
              "Log in to your Raspberry Pi account to save your work, and you'll be able to access and edit your project whenever you need to.",
          },
          modals: {
            close: "Close",
          },
          notifications: {
            close: "close",
            loginPrompt:
              "To save this project and access it later, don't forget to log in or sign up!",
            projectRemixed: "Your remixed project has been saved",
            projectRenamed: "You have renamed your project.",
            projectSaved: "Your project has been saved",
            savePrompt:
              'Save this project to access it later under "Your projects".',
          },
          output: {
            errors: {
              interrupted: "Execution interrupted",
            },
            senseHat: {
              controls: {
                colour: "colour",
                humidity: "humidity",
                motion: "motion",
                motionSensorOptions: {
                  no: "No",
                  yes: "Yes",
                },
                name: "Space Station Control Panel",
                pressure: "pressure",
                temperature: "temperature",
                timer: "timer",
              },
              model: {
                pitch: "pitch",
                roll: "roll",
                yaw: "yaw",
              },
            },
            textOutput: "Text Output",
            visualOutput: "Visual Output",
          },
          outputViewToggle: {
            buttonTabLabel: "Tabbed view",
            buttonTabTitle: "Tabbed view",
            buttonSplitLabel: "Split view",
            buttonSplitTitle: "Split view",
          },
          project: {
            accessDeniedNoAuthModal: {
              heading: "You are not able to see this project",
              loginButtonText: "Log in to your account",
              newProject: "Create a new code project",
              projectsSiteLinkText: "Explore Projects site",
              text: "If this is your project, log in to see it. If this is not your project you can visit the Projects site for cool project ideas or to start coding in a new project.",
            },
            accessDeniedWithAuthModal: {
              heading: "You can't access this project",
              newProject: "Create a new code project",
              projectsSiteLinkText: "Explore Projects site",
              text: "Visit the Projects site for cool project ideas or start coding in a new project.",
            },
            loading: "Loading",
            notFoundModal: {
              heading: "This project does not exist",
              newProject: "Start new code project",
              projectsSiteLinkText: "Explore Projects site",
              text: "You can start coding in a new project, or visit the Projects site for cool project ideas.",
            },
            untitled: "Untitled project",
          },
          projectHeader: {
            subTitle: "Code Editor",
            title: "Your projects",
            text: "Select a project to edit, view and open to continue coding.",
          },
          projectList: {
            delete: "Delete",
            deleteLabel: "Delete project",
            deleteProjectModal: {
              cancel: "Cancel",
              delete: "Delete",
              heading: "Delete project",
              text: "Are you sure you want to delete this project?",
            },
            empty: "No projects created yet",
            label: "Open project menu",
            loading: "Loading",
            loadingFailed: "Failed to load projects",
            pagination: {
              first: "First page",
              last: "Last page",
              next: "Next page",
              previous: "Previous page",
              more: "Load more projects",
            },
            rename: "Rename",
            renameLabel: "Rename project",
            renameProjectModal: {
              cancel: "Do not save",
              heading: "Rename project",
              inputLabel: "Change the name of your project",
              save: "Save",
            },
            updated: "Edited",
            python_type: "Python",
            html_type: "HTML",
          },
          runButton: {
            run: "Run",
            stop: "Stop",
            stopping: "Stopping...",
          },
          runners: {
            HtmlOutput: "HTML Output Preview",
          },
          sideMenu: {
            collapse: "Collapse file pane",
            expand: "Expand file pane",
            file: "Project files",
          },
        },
      },
    },
  });

export default i18n;
