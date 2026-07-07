# Scratch Frame

Scratch Frame is a wrapper for the Scratch Editor, allowing more control over Scratch dependencies and isolation from the containing page.

## Commands

- Run: `yarn start`
- Build: `yarn build`
- Test: `yarn test`

The Vite dev server runs on port `3014`.


## Iframe Parameters

| Parameter | Required | Description |
| --- | --- | --- |
| `project_id` | Yes | Scratch project identifier to load. |
| `api_url` | Yes | Base URL for project and asset requests. |
| `parent_origin` | No | Origin to receive iframe messages. Defaults to the iframe origin. |
| `scratchMetadata` | Yes | Required to allow Scratch to send customer headers with API requests |

## Messages

Scratch Frame uses messages to communicate with it's containing page.

### Received from the containing page

| Type | Payload | Action |
| --- | --- | --- |
| `scratch-gui-set-token` | `nonce`, `accessToken`, `requiresAuth` | Completes the startup handshake and mounts Scratch. |
| `scratch-gui-update-token` | `accessToken` | Updates the API authorization token. |
| `scratch-gui-download` | `filename` | Saves the current project as an `.sb3` file. |
| `scratch-gui-upload` | `file` | Loads a Scratch project from the supplied file. |
| `scratch-gui-save` | - | Triggers a manual save. |
| `scratch-gui-remix` | - | Triggers a remix. |

### Sent to the containing page

| Type | Payload | When |
| --- | --- | --- |
| `scratch-gui-ready` | `nonce` | Repeated until the container replies with `scratch-gui-set-token`. |
| `scratch-gui-project-changed` | - | The Scratch VM project changes, including after upload. |
| `scratch-gui-project-run-started` | - | The Scratch project starts running. |
| `scratch-gui-project-id-updated` | `projectId` | Scratch creates or updates a project id. |
| `scratch-gui-saving-started` | - | Save starts. |
| `scratch-gui-saving-succeeded` | - | Save succeeds. |
| `scratch-gui-saving-failed` | - | Save fails. |
| `scratch-gui-remixing-started` | - | Remix starts. |
| `scratch-gui-remixing-succeeded` | - | Remix succeeds. |
| `scratch-gui-remixing-failed` | - | Remix fails. |

