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
    debug: process.env.I18N_DEBUG === "true",
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
          landingPage: {
            title: "Code Editor",
            subtitle: "Start coding, no setup required!",
            python: "Start coding Python",
            html: "Start coding HTML/CSS",
            login: "Log in",
            hero: {
              title: "Same great code editor, now in your classroom.",
              subtitle: "Free now, free forever.",
              createSchool: "Create a School",
              logIn: "Log in as a student",
            },
            start: "Not sure where to start?",
            projectPython: "Python path",
            projectHtml: "Web path",
          },
          educationLandingPage: {
            title: "Get started today!",
            start: "Create your school account",
            ide: {
              title: "An IDE designed for learners",
              text: "Tailored specifically to young people's needs, our integrated development environment (IDE) helps make learning text-based programming simple and accessible for children aged 9 and up. It’s safe, age-appropriate, and suitable for use in the classroom.",
              imageAlt: "Editor screenshot",
            },
            free: {
              title: "All features, totally free",
              text: "Create custom coding projects for your students to work on. Help them code their own games and art using Python, or design websites in HTML/CSS/JavaScript. Your students can get creative with code with our wide choice of Python libraries!",
              imageAlt: "Editor output",
            },
            engage: {
              title: "Create engaging coding lessons",
              text: "Create custom coding projects for your students to work on. Help them code their own games and art using Python, or design websites in HTML/CSS/JavaScript. Your students can get creative with code with our wide choice of Python libraries!",
              imageAlt: "",
            },
            feedback: {
              title: "Give students personalised feedback",
              text: "Easily check your students’ progress, view their coding projects, and share individual, instant feedback with each student to keep them on track.",
              imageAlt: "",
            },
            class: {
              title: "Simple and easy class management",
              text: "Like the Editor itself, we’ve kept our educator interface clean, simple, and easy to use following feedback from teachers. Create and manage student accounts easily. You can organise your students into classes and help them reset their passwords quickly.",
              imageAlt: "",
            },
            safe: {
              title: "Safe and private by design",
              text: "Accounts for education are designed to be safe for students of all ages. We take safeguarding seriously, with one-way feedback to students, visibility of their work at all times, verified school accounts, and an audit history of communication with students.<br/><br/>In line with best practice codes protecting children online, we minimise our data capture so that we have just enough to keep students safe.",
              imageAlt: "",
            },
            people: {
              title: "What do people say about our Editor?",
              text: "<i>“We have used it and love it, the fact that it is both for HTML / CSS and then Python is great as the students have a one-stop shop for IDEs.”</i><br/><strong>Lee Willis, Head of ICT and Computing, Newcastle High School for Girls</strong><br/><br/><i>“The class management and feedback features they're working on at the moment look really promising.”<i/><br/><strong>Pete Dring, Head of Computing, Fulford School</strong>",
              imageAlt: "",
            },
          },
          logoLM: {
            codeEditor: "Code Editor",
            forEducation: "For Education",
          },
          multiStepForm: {
            cancel: "Cancel",
            continue: "Continue",
            back: "Back",
            submit: "Submit",
          },
          schoolOnboarding: {
            step: "Step title",
            apiErrorTitle: "There was a problem submitting the form",
            errorTitle: "There is a problem with the form",
            steps: {
              errors: {
                401: "You must be logged in to create a school.",
                500: "An unknown error occurred",
              },
              step1: {
                title: "Before you start creating your school account",
                thingsToKnow:
                  "There are a few things you need to know before you set up an account for your school:",
                employee:
                  "You need to be an <0>employee of the school</0>, however you do not need to be a teacher.",
                owner:
                  "You will become the <0>owner of the school account</0>. This comes with responsibilities you will need to agree to.",
                verification:
                  "Your school will need to be <0>verified by our team</0>. This may take up to 5 working days.",
                email:
                  "You will <0>not be able to change your email address</0> or delete your Raspberry Pi Foundation account while you are the owner of the school account. You will have to contact us to do this.",
                notSchoolQuestion:
                  "Can I use this if I am not part of a school?",
                notSchoolAnswer:
                  "No, Code Editor for Education is only available to schools at this time.",
              },
              step2: {
                title: "Do you agree to be responsible for the school account?",
                owner:
                  "Creating the school account will make you the <0>owner</0>.",
                responsibilities:
                  "As an account <0>owner</0> you must agree to be responsible for:",
                responsibility1: "This is a responsibility.",
                responsibility2: "This is a responsibility.",
                responsibility3: "This is a responsibility.",
                responsibility4: "This is a responsibility.",
                responsibility5: "This is a responsibility.",
                termsAndConditions:
                  "Full responsibilities are outlined in the school account <0>Terms and conditions</0>, so please ensure you read these.",
                agreeAuthority:
                  "I have the authority to create this account on behalf of my school.",
                agreeResponsibility:
                  "I agree to be responsible for this school account and I accept the <0>Terms and conditions</0>.",
                validation: {
                  errors: {
                    message:
                      "You must agree to the following responsibilities and Terms and conditions to continue.",
                    authority: "You must confirm you have authority",
                    responsibility:
                      "You must confirm you accept responsibility",
                  },
                },
              },
              step3: {
                title: "What is your role at the School?",
                optionalInfo:
                  "Providing this information is optional, however it helps us to understand our users, how the platform is used, and how we can improve it.",
                role: "What is your role at the School? (Optional)",
                otherRole: "Please tell us your role",
                select: "Please select",
                teacher: "Teacher",
                headOfDepartment: "Head of Department",
                admin: "Administrative staff",
                other: "Other",
                department: "What department are you part of? (Optional)",
                departmentHint:
                  "For example, Computing, IT, Science, English, Art, etc.",
              },
              step4: {
                title: "Tell us about your school",
                schoolDetails:
                  "In order to set up your school in the Editor, we require some details about your school so we can verify it.",
                schoolName: "School name",
                schoolWebsite: "School website",
                schoolAddress: "School address",
                schoolAddress1: "Address line 1",
                schoolAddress2: "Address line 2 (Optional)",
                schoolCity: "Village/Town/City",
                schoolState: "State/County/Province",
                schoolPostcode: "Postal code/Zip code",
                schoolCountry: "Country",
                select: "Please select",
                schoolUrn: "School URN (Optional)",
                schoolUrnHint:
                  "This can be found on the UK Government website <0>here</0>. Although this is not required it will help us to verify your school account.",
                validation: {
                  errors: {
                    message: "Please check the fields.",
                    schoolName: "You must supply your school's name",
                    schoolWebsite: "The school website doesn't look right.",
                    schoolAddress1:
                      "You must supply Address line 1 of your school.",
                    schoolCity:
                      "You must supply your school's Village/Town/City.",
                    schoolState:
                      "You must supply your school's State/County/Province.",
                    schoolPostcode:
                      "You must supply your school's Postal code/Zip code.",
                    schoolCountry: "Please select a country from the list.",
                  },
                },
              },
            },
          },
          schoolAlreadyExists: {
            title: "You already have a School account",
            explanation:
              "There's already an account linked to this Raspberry Pi Foundation account. If you wish to create another account for a different school, you will need to use a different Raspberry Pi Foundation account.",
            contact:
              "If you have any issues you can contact us via email: <0>websupport@raspberrypi.org</0>.",
            exploreProjects: "Explore our projects",
            editorHome: "Code Editor home",
          },
          schoolBeingVerified: {
            title: "Your school account is being verified",
            text: "You have already set up a school account and it is now in the process of being verified. If you wish to set up another account for a different school, you must use a different Raspberry Pi Foundation account.",
            next: "What happens next?",
            contact:
              "If you have any issues you can contact us via email: <0>websupport@raspberrypi.org</0>. Please wait at least 5 working days before contacting us about verifying your school.",
            listItems: {
              item1:
                "Thank you for providing the all the information needed to set up your school account.",
              item2:
                "We will verify your school. This may take up to 5 working days. You'll receive a confirmation email once it's been verified.",
              item3:
                "Once your school has been verified, you will be able to log in to the Code Editor with your Raspberry Pi Foundation account and access your school dashboard.",
            },
            exploreProjects: {
              text: "Explore our projects",
              url: "https://example.com/button1",
              plausible: "Explore our projects",
            },
            editorHome: {
              text: "Code Editor home",
              url: "/",
              plausible: "Code Editor home",
            },
          },
          schoolCreated: {
            title: "School account created!",
            text: "Thank you for setting up your school account in the Code Editor!",
            next: "What happens next?",
            contact:
              "If you have any issues you can contact us via email: <0>websupport@raspberrypi.org</0>. Please wait at least 5 working days before contacting us about verifying your school.",
            listItems: {
              item1:
                "Thank you for providing the all the information needed to set up your school account.",
              item2:
                "We will verify your school. This may take up to 5 working days. You'll receive a confirmation email once it's been verified.",
              item3:
                "Once your school has been verified, you will be able to log in to the Code Editor with your Raspberry Pi Foundation account and access your school dashboard.",
            },
            exploreProjects: {
              text: "Explore our projects",
              url: "https://example.com/button1",
              plausible: "Explore our projects",
            },
            editorHome: {
              text: "Code Editor home",
              url: "/",
              plausible: "Code Editor home",
            },
          },
          schoolDashboard: {
            codeEditorHome: "Code Editor home",
            manageMembers: "Manage members",
          },
          membersPage: {
            title: "Members page",
          },
          membersPageHeader: {
            title: "School members",
            text: "These are all the members in your school, this includes, students, teachers and owners.",
            invite: "Invite teacher",
            create: "Create student",
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
          newProjectModal: {
            cancel: "Cancel",
            createProject: "Create project",
            heading: "Create a new project",
            projectName: {
              default: "Untitled",
              helpText: "You can always rename your project later",
              inputLabel: "Project name",
            },
            projectType: {
              html: "HTML",
              inputLabel: "What kind of project do you want to make?",
              python: "Python",
            },
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
            accessDeniedNoAuthModal: {
              embedded: {
                text: "Visit the Projects site for cool project ideas",
              },
              heading: "You are not able to see this project",
              loginButtonText: "Log in to your account",
              newProject: "Create a new code project",
              projectsSiteLinkText: "Explore Projects site",
              text: "If this is your project, log in to see it. If this is not your project you can visit the Projects site for cool project ideas or to start coding in a new project.",
            },
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
          },
        },
      },
    },
  });

export default i18n;
