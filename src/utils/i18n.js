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
      "xx-XX",
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
      "xx-XX",
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
              error: "Error",
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
            close: "close",
          },
          filePanel: {
            errors: {
              reservedFileName:
                "{{fileName}} is a reserved file name. Please choose a different name.",
              containsSpaces: "File names must not contain spaces.",
              generalError: "Error",
              notUnique: "File names must be unique.",
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
            emptyState: {
              addInstructions: "Add instructions",
              edits:
                "Like project code, students will not see any edits you make to the instructions after they have saved their version of the project.",
              location:
                "These instructions will be shown to students in their project sidebar and will be view-only.",
              markdown: "Instructions are written in <0>markdown</0>.",
              purpose:
                "Instructions can be added to your project to guide students.",
            },
            removeInstructions: "Remove instructions",
            nextStep: "Next step",
            previousStep: "Previous step",
            projectSteps: "Project instructions",
            edit: "Edit",
            view: "View",
            removeInstructionsModal: {
              removeInstructions: "Remove instructions",
              close: "Close",
              heading: "Remove project instructions?",
              removeInstuctionsWarning:
                "You are about to remove the instructions from the project.",
              resultRemovingInstructions:
                "As a result of removing these instructions:",
              instructionsWillBeDeleted:
                "Instructions content will be deleted.",
              studentsWorkingProjectNotRecievedInstructions:
                "Students who start working on this project will not receive instructions.",
              studentsStartedWillSeeInstructions:
                "Students who have already started working on this project will still be able to see the instructions as they were when they started.",
            },
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
            instructions: "Project instructions",
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
          imageUploadButton: {
            uploadImage: "Upload Image",
            uploadAnImage: "Upload an image",
            info: "Drag and drop images here, or click to select images from file",
            cancel: "Cancel",
            save: "Save",
            or: "or",
            errors: {
              error: "Error",
              imageNameNotUnique: "Image names must be unique.",
              invalidImageExtension: "Image names must end in {{extensions}}.",
            },
          },
          newInputPanelButton: {
            buttonText: "Add another panel",
          },
          button: {
            yes: "Yes",
            no: "No",
          },
          common: {
            or: "or",
          },
        },
      },
      "xx-XX": {
        translation: {
          modal: {
            close: "Schließen",
            error: {
              error: "Fehler",
              heading: "Ein Fehler ist aufgetreten",
              externalLink: {
                message:
                  "Leider sind Links zu externen Seiten im Editor nicht verfügbar.",
              },
            },
          },
          editorPanel: {
            ariaLabel: "Texteingabe des Editors",
            characterLimitError: "Fehler: Zeichenlimit erreicht",
            characterLimitExplanation:
              "Dateien im Editor sind auf {{maxCharacters}} Zeichen begrenzt",
            viewOnly: "Nur Ansicht",
            close: "schließen",
          },
          filePanel: {
            errors: {
              reservedFileName:
                "{{fileName}} ist ein reservierter Dateiname. Bitte wählen Sie einen anderen Namen.",
              containsSpaces: "Dateinamen dürfen keine Leerzeichen enthalten.",
              generalError: "Fehler",
              notUnique: "Dateinamen müssen eindeutig sein.",
              unsupportedExtension:
                "Dateinamen müssen mit {{allowedExtensions}} enden.",
            },
            files: "Projektdateien",
            images: "Bildergalerie",
            newFileButton: "Datei hinzufügen",
            newFileModal: {
              cancel: "Abbrechen",
              heading: "Eine neue Datei zu Ihrem Projekt hinzufügen",
              helpText:
                "Denken Sie daran, die Dateiendung am Ende Ihres Dateinamens hinzuzufügen, zum Beispiel {{examples}}",
              helpTextExample: {
                html: "'datei.html', 'datei.css' oder 'datei.js'",
                python: "'datei.py'",
              },
              inputLabel: "Benennen Sie Ihre Datei",
              addFile: "Datei hinzufügen",
            },
            renameFileModal: {
              cancel: "Abbrechen",
              heading: "Datei umbenennen",
              inputLabel: "Benennen Sie Ihre Datei",
              save: "Speichern",
            },
            fileMenu: {
              label: "Datei-Menü öffnen",
              renameItem: "Datei umbenennen",
            },
          },
          downloadPanel: {
            heading: "Speichern & herunterladen",
            logInTitle: "Melden Sie sich an, um Ihren Fortschritt zu speichern",
            logInHint:
              "Mit einem Raspberry Pi Konto können Sie Ihren Code und den Fortschritt Ihrer Projektschritte speichern.",
            logInButton: "Zum Speichern anmelden",
            signUpButton: "Registrieren",
            downloadHint:
              "Laden Sie Ihre Projektdateien herunter, damit Sie sie offline und in einem anderen Code-Editor verwenden können.",
            downloadButton: "Projekt herunterladen",
          },
          footer: {
            accessibility: "Barrierefreiheit",
            charityNameAndNumber:
              "Raspberry Pi Foundation UK eingetragene Wohltätigkeitsorganisation 1129409",
            cookies: "Cookies",
            privacy: "Datenschutz",
            safeguarding: "Kinderschutz",
          },
          projectName: {
            label: "Projektname",
            newProject: "Neues Projekt",
          },
          header: {
            download: "Herunterladen",
            downloadFileNameDefault: "mein {{project_type}} Projekt",
            editorLogoAltText: "Editor-Logo",
            projects: "Ihre Projekte",
            renameProject: "Projektnamen bearbeiten",
            renameSave: "Projektnamen speichern",
            save: "Speichern",
            loginToSave: "Zum Speichern anmelden",
            settings: "Einstellungen",
          },
          imagePanel: {
            gallery: "Bildergalerie",
          },
          infoPanel: {
            info: "Informationen",
          },
          instructionsPanel: {
            emptyState: {
              addInstructions: "Anweisungen hinzufügen",
              edits:
                "Wie beim Projektcode sehen die Schüler keine Änderungen, die Sie an den Anweisungen vornehmen, nachdem sie ihre Version des Projekts gespeichert haben.",
              location:
                "Diese Anweisungen werden den Schülern in ihrer Projekt-Seitenleiste angezeigt und sind schreibgeschützt.",
              markdown: "Anweisungen werden in Markdown geschrieben.",
              purpose:
                "Anweisungen können zu Ihrem Projekt hinzugefügt werden, um die Schüler anzuleiten.",
            },
            removeInstructions: "Anweisungen entfernen",
            nextStep: "Nächster Schritt",
            previousStep: "Vorheriger Schritt",
            projectSteps: "Projektablauf",
            edit: "Bearbeiten",
            view: "Anzeigen",
            removeInstructionsModal: {
              removeInstructions: "Anweisungen entfernen",
              close: "Schließen",
              heading: "Projektanweisungen entfernen?",
              removeInstuctionsWarning:
                "Sie sind dabei, die Anweisungen aus dem Projekt zu entfernen.",
              resultRemovingInstructions:
                "Als Ergebnis des Entfernens dieser Anweisungen:",
              instructionsWillBeDeleted:
                "Der Inhalt der Anweisungen wird gelöscht.",
              studentsWorkingProjectNotRecievedInstructions:
                "Schüler, die mit diesem Projekt beginnen, erhalten keine Anweisungen.",
              studentsStartedWillSeeInstructions:
                "Schüler, die bereits mit diesem Projekt begonnen haben, können die Anweisungen weiterhin so sehen, wie sie beim Start waren.",
            },
          },
          projectsPanel: {
            projects: "Projekte",
            yourProjectsButton: "Zu Ihren Projekten gehen",
            projectTypeLabel: "Projekttyp",
          },
          settingsPanel: {
            info: "Einstellungen",
          },
          input: {
            comment: {
              py5: "Py5: importierter Modus",
            },
          },
          mobile: {
            code: "Code",
            menu: "Menü",
            output: "Ausgabe",
            preview: "Vorschau",
            steps: "Schritte",
          },
          modals: {
            close: "Schließen",
          },
          notifications: {
            close: "schließen",
            loginPrompt:
              "Um dieses Projekt zu speichern und später darauf zuzugreifen, vergessen Sie nicht, sich anzumelden oder zu registrieren!",
            projectRemixed: "Ihr neu gemischtes Projekt wurde gespeichert",
            projectRenamed: "Sie haben Ihr Projekt umbenannt.",
            projectSaved: "Ihr Projekt wurde gespeichert",
            savePrompt:
              "Speichern Sie dieses Projekt, um später unter „Ihre Projekte“ darauf zuzugreifen.",
          },
          output: {
            errors: {
              interrupted: "Ausführung unterbrochen",
            },
            newTab: "Vorschau in neuem Tab",
            preview: "Vorschau",
            senseHat: {
              controls: {
                colour: "Farbe",
                humidity: "Feuchtigkeit",
                motion: "Bewegung",
                motionSensorOptions: {
                  no: "Nein",
                  yes: "Ja",
                },
                name: "Steuerungspanel der Raumstation",
                pressure: "Druck",
                temperature: "Temperatur",
                timer: "Timer",
              },
              model: {
                pitch: "Neigung",
                roll: "Rollen",
                yaw: "Gieren",
              },
            },
            textOutput: "Textausgabe",
            visualOutput: "Visuelle Ausgabe",
          },
          outputViewToggle: {
            buttonTabLabel: "Tab-Ansicht",
            buttonTabTitle: "Tab-Ansicht",
            buttonSplitLabel: "Geteilte Ansicht",
            buttonSplitTitle: "Geteilte Ansicht",
          },
          project: {
            accessDeniedWithAuthModal: {
              embedded: {
                text: "Besuchen Sie die Projektseite für tolle Projektideen",
              },
              heading: "Sie können auf dieses Projekt nicht zugreifen",
              newProject: "Ein neues Code-Projekt erstellen",
              projectsSiteLinkText: "Projektseite erkunden",
              text: "Besuchen Sie die Projektseite für tolle Projektideen oder beginnen Sie mit dem Programmieren in einem neuen Projekt.",
            },
            loading: "Wird geladen",
            notFoundModal: {
              embedded: {
                text: "Besuchen Sie die Projektseite für tolle Projektideen",
              },
              heading: "Dieses Projekt existiert nicht",
              newProject: "Neues Code-Projekt starten",
              projectsSiteLinkText: "Projektseite erkunden",
              text: "Sie können mit dem Programmieren in einem neuen Projekt beginnen oder die Projektseite für tolle Projektideen besuchen.",
            },
            untitled: "Unbenanntes Projekt",
          },
          projectHeader: {
            subTitle: "Code-Editor",
            title: "Ihre Projekte",
            text: "Wählen Sie ein Projekt aus, um mit dem Programmieren fortzufahren, es anzuzeigen oder zu bearbeiten.",
          },
          projectList: {
            delete: "Löschen",
            deleteLabel: "Projekt löschen",
            empty: "Noch keine Projekte erstellt",
            label: "Projektmenü öffnen",
            loading: "Wird geladen",
            loadingFailed: "Fehler beim Laden der Projekte",
            newProject: "Neues Projekt erstellen",
            pagination: {
              first: "Erste Seite",
              last: "Letzte Seite",
              next: "Nächste Seite",
              previous: "Vorherige Seite",
              more: "Weitere Projekte laden",
            },
            rename: "Umbenennen",
            renameLabel: "Projekt umbenennen",
            renameProjectModal: {
              cancel: "Nicht speichern",
              heading: "Projekt umbenennen",
              inputLabel: "Ändern Sie den Namen Ihres Projekts",
              save: "Speichern",
            },
            updated: "Bearbeitet",
            python_type: "Python",
            html_type: "HTML",
          },
          projectTypes: {
            html: "HTML/CSS",
            python: "Python",
          },
          runButton: {
            run: "Ausführen",
            stop: "Stopp",
            stopping: "Wird gestoppt...",
          },
          saveStatus: {
            saving: "Wird gespeichert",
            saved: "Gespeichert",
          },
          runners: {
            HtmlOutput: "HTML-Ausgabevorschau",
          },
          sidebar: {
            collapse: "Seitenleiste einklappen",
            download: "Projekt herunterladen",
            expand: "Seitenleiste ausklappen",
            file: "Projektdateien",
            images: "Bildergalerie",
            settings: "Einstellungen",
            projects: "Projekte",
            information: "Informationen",
            information_text:
              "Unser Code-Editor ist ein Werkzeug, um jungen Menschen das Programmieren zu erleichtern. Wir haben nur Funktionen integriert, die einfach und sicher zu bedienen sind. Deshalb sind beispielsweise Links zu anderen Webseiten nicht erlaubt.",
            instructions: "Projektanweisungen",
            feedback: "Feedback",
            help: "Hilfe",
            privacy: "Datenschutz",
            cookies: "Cookies",
            accessibility: "Barrierefreiheit",
            safeguarding: "Kinderschutz",
            charity:
              "Raspberry Pi Foundation - eingetragene Wohltätigkeitsorganisation in Großbritannien 1129409",
            settingsMenu: {
              heading: "Einstellungen",
              textSize: "Textgröße",
              theme: "Thema",
              textSizeOptions: {
                large: "Groß",
                medium: "Mittel",
                small: "Klein",
              },
              themeOptions: {
                dark: "Dunkel",
                light: "Hell",
              },
            },
          },
          webComponent: {
            loading: "Wird geladen",
            failed: "Laden fehlgeschlagen",
          },
          imageUploadButton: {
            uploadImage: "Bild hochladen",
            uploadAnImage: "Laden Sie ein Bild hoch",
            info: "Ziehen Sie Bilder hierher, oder klicken Sie, um Bilder aus der Datei auszuwählen",
            cancel: "Stornieren",
            save: "Speichern",
            errors: {
              error: "Fehler",
              imageNameNotUnique: "Bildnamen müssen eindeutig sein.",
              invalidImageExtension:
                "Bildnamen müssen enden auf {{extensions}}.",
            },
          },
          newInputPanelButton: {
            buttonText: "Fügen Sie ein weiteres Panel hinzu",
          },
          button: {
            yes: "Ja",
            no: "Nein",
          },
          common: {
            or: "oder",
          },
        },
      },
    },
  });

export default i18n;
