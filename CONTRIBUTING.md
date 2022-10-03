# Contributor Guidelines for the Code Editor
## Index
1. [What is the Code Editor from Raspberry Pi Foundation](https://github.com/RaspberryPiFoundation/editor-ui/edit/add-oss-documentation/CONTRIBUTING.md?pr=%2FRaspberryPiFoundation%2Feditor-ui%2Fpull%2F207#1-what-is-the-code-editor-from-raspberry-pi-foundation)
2. [Latest versioning and future releases](https://github.com/RaspberryPiFoundation/editor-ui/edit/add-oss-documentation/CONTRIBUTING.md?pr=%2FRaspberryPiFoundation%2Feditor-ui%2Fpull%2F207#2-latest-versioning-and-future-releases)
3. [How you can help contribute to this project](https://github.com/RaspberryPiFoundation/editor-ui/edit/add-oss-documentation/CONTRIBUTING.md?pr=%2FRaspberryPiFoundation%2Feditor-ui%2Fpull%2F207#3-how-you-can-help-contribute-to-this-project)
4. [How we use your code and licensing](https://github.com/RaspberryPiFoundation/editor-ui/edit/add-oss-documentation/CONTRIBUTING.md?pr=%2FRaspberryPiFoundation%2Feditor-ui%2Fpull%2F207#4-how-we-use-your-code-and-licensing)

## 1. What is the Code Editor from Raspberry Pi Foundation
Raspberry Pi Foundation is a UK-based charity with global reach. Our mission is to enable young people to realise their full potential through the power of computing and digital technologies. You can find out more about Raspberry Pi Foundation on our [About us page](https://www.raspberrypi.org/about/).

To support young people to learn how to code, in both formal and informal education settings, we’ve designed our [Code Editor](https://editor.raspberrypi.org/) to support text-based programming languages, including Python, CSS and HTML.

## 2. Latest versioning and future releases
The Code Editor from Raspberry Pi Foundation is currently live as a Beta Release. This means there may still be some issues and bugs which we’ll be working on fixing, and where Contributors identify particularly useful features we may consider implementing them. 

Our current priorities will be working on bugs, making sure the Editor is stable, and extending the functionality so that it supports young people to learn to code.

As this project is in its infancy, we encourage Contributors to check this documentation from time to time, as we refine our processes, and update you on our Roadmap changes.

**Q4 2022 priority features:**
- Beta testing and iterating based on user feedback (i.e. the young people using our Code Editor)
- Design review including key improvements for supporting smaller screen devices (tablet and mobile responsiveness)
- Linting v.1
- Downloading code
- Auto-saving code

**2023 H1 priority features:**
- Supporting for translations and self-serve content updates by our internal content authors
- Extending supported libraries
- Sharing and remixing v.1

You can track our progress for feature releases and recent changes by checking our [Change Log](https://github.com/RaspberryPiFoundation/editor-ui/blob/main/CHANGELOG.md).

## 3. How you can help contribute to this project
Please see our section [Latest versioning and feature releases](https://github.com/RaspberryPiFoundation/editor-ui/edit/add-oss-documentation/CONTRIBUTING.md?pr=%2FRaspberryPiFoundation%2Feditor-ui%2Fpull%2F207#2-latest-versioning-and-future-releases)for high level information about the code in the main branch repository, and up and coming releases.

We’re happy to receive pull requests for upcoming versions to fix bugs, add features and refactor code; your suggestions will help us improve our Code Editor, so we can support more young people to learn how to code. 
**But please note:** as this project is in Beta, we cannot guarantee that there’ll be capacity to review all Pull Requests and Feature suggestions at this time, so we recommend checking the change log and contacting us (ADD IN MAILBOX OR OUTLINE HOW THEY DO THIS?) before raising any large-scale PRs or commits.

### Our environments 
Our [Production version of our Code Editor](https://editor.raspberrypi.org/)

You can find furhter information in our [README documentation](https://github.com/RaspberryPiFoundation/editor-ui#readme).

### Submitting a Pull Request and adding a Commit
- Restricted to one change or feature each.
- The commit history should consist of a number of commits that are easy to review as possible. 
- Where one commit is fixing errors in an earlier commit in the set, please simply merge them.
- Where a commit is reverting an earlier commit in the set, please remove the commit entirely.
- Please avoid adding merge commits or any other unnecessary commits.
- The commit message should have a short line description at the top. Additional lines with more detail should be added as relevant in the code.
- In general, we don't need to see all the trials, errors and bug-fixes that went into this change, we only want to understand how it works now!

### Testing your code
- Before submitting a pull request, please ensure that all the automated tests are passing for all the commits in the set
- You can do this using the command prompt tools/run_tests. 
- Any documentation should be updated accordingly. New examples and tests should be included wherever possible. Also consider making an entry in the change log.

### Examples of a commit and coding conventions
Words here? Or remove for now?

## 4. How we use your code and licensing
By submitting a Pull Request, you are agreeing to your code and contribution to this project being licensed and shared as part of [our Open Source Licence](insert link to Apache OS licence).
 
**Thank you, your contribution helps us to improve our products, and to help young people around the world to take part in Digital Making!**
