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
          editorPanel: {
            ariaLabel: "editor text input",
            characterLimitError: "Error: Character limit reached",
            characterLimitExplanation:
              "Files in the editor are limited to {{maxCharacters}} characters",
            viewOnly: "View only",
          },
          filePanel: {
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
            newFileModal: {
              cancel: "Cancel",
              heading: "Add a new file to your project",
              helpText:
                "Remember to add the file extension at the end of your file name, for example, {{examples}}",
              helpTextExample: {
                html: "'file.html', 'file.css' or 'file.js'",
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
          downloadPanel: {
            heading: "Save & download",
            logInTitle: "Log in to save your progress",
            logInHint:
              "With a Raspberry Pi Account you can save your code and project steps progress.",
            logInButton: "Log in to save",
            signUpButton: "Sign up",
            downloadHint:
              "Download your project files so you can use them offline and in a different code editor.",
            downloadButton: "Download project",
          },
          footer: {
            accessibility: "Accessibility",
            charityNameAndNumber:
              "Raspberry Pi Foundation UK registered charity 1129409",
            cookies: "Cookies",
            privacy: "Privacy",
            safeguarding: "Safeguarding",
          },
          projectName: {
            label: "Project name",
            newProject: "New Project",
          },
          header: {
            download: "Download",
            downloadFileNameDefault: "my {{project_type}} project",
            editorLogoAltText: "Editor logo",
            projects: "Your projects",
            renameProject: "Edit project name",
            renameSave: "Save project name",
            save: "Save",
            loginToSave: "Log in to save",
            settings: "Settings",
          },
          imagePanel: {
            gallery: "Image Gallery",
          },
          infoPanel: {
            info: "Information",
          },
          instructionsPanel: {
            nextStep: "Next step",
            previousStep: "Previous step",
            projectSteps: "Project steps",
            edit: "Edit",
            view: "View",
          },
          projectsPanel: {
            projects: "Projects",
            yourProjectsButton: "Go to your projects",
            projectTypeLabel: "Project type",
          },
          settingsPanel: {
            info: "Settings",
          },
          input: {
            comment: {
              py5: "Py5: imported mode",
            },
          },
          mobile: {
            code: "Code",
            menu: "Menu",
            output: "Output",
            preview: "Preview",
            steps: "Steps",
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
            newTab: "Preview in new tab",
            preview: "preview",
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
            textOutput: "Text output",
            visualOutput: "Visual output",
          },
          outputViewToggle: {
            buttonTabLabel: "Tabbed view",
            buttonTabTitle: "Tabbed view",
            buttonSplitLabel: "Split view",
            buttonSplitTitle: "Split view",
          },
          project: {
            accessDeniedWithAuthModal: {
              embedded: {
                text: "Visit the Projects site for cool project ideas",
              },
              heading: "You can't access this project",
              newProject: "Create a new code project",
              projectsSiteLinkText: "Explore Projects site",
              text: "Visit the Projects site for cool project ideas or start coding in a new project.",
            },
            loading: "Loading",
            notFoundModal: {
              embedded: {
                text: "Visit the Projects site for cool project ideas",
              },
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
            text: "Select a project to continue coding, view, or edit it.",
          },
          projectList: {
            delete: "Delete",
            deleteLabel: "Delete project",
            empty: "No projects created yet",
            label: "Open project menu",
            loading: "Loading",
            loadingFailed: "Failed to load projects",
            newProject: "Create a new project",
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
          projectTypes: {
            html: "HTML/CSS",
            python: "Python",
          },
          runButton: {
            run: "Run",
            stop: "Stop",
            stopping: "Stopping...",
          },
          saveStatus: {
            saving: "Saving",
            saved: "Saved",
          },
          runners: {
            HtmlOutput: "HTML Output Preview",
          },
          sidebar: {
            collapse: "Collapse sidebar",
            download: "Download project",
            expand: "Expand sidebar",
            file: "Project files",
            images: "Image gallery",
            settings: "Settings",
            projects: "Projects",
            information: "Information",
            information_text:
              "Our Code Editor is a tool to help young people learn to code. We have only included functions that are simple and safe to use. That's why, for example, links to other websites are not allowed.",
            instructions: "Project steps",
            feedback: "Feedback",
            help: "Help",
            privacy: "Privacy",
            cookies: "Cookies",
            accessibility: "Accessibility",
            safeguarding: "Safeguarding",
            charity: "Raspberry Pi Foundation - UK registered charity 1129409",
            settingsMenu: {
              heading: "Settings",
              textSize: "Text size",
              theme: "Theme",
              textSizeOptions: {
                large: "Large",
                medium: "Medium",
                small: "Small",
              },
              themeOptions: {
                dark: "Dark",
                light: "Light",
              },
            },
          },
          webComponent: {
            loading: "Loading",
            failed: "Load failed",
          },
        },
      },
    },
  });

export default i18n;
