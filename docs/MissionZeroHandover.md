# Mission Zero Handover

## Introduction

The python editor has been bundled into a web component for use in Mission Zero. The content of the editor web component is isolated within a shadow DOM that is not accessible to the host page and is unaffected by its styling.

## Setup

The web component can be embedded on a host page by using `<editor-wc>` tags and including the associated JavaScript bundle in a `<script>` tag on the page. The initial code to be shown in the editor is passed as an attribute to the `<editor-wc>` element. For example:
```html
    <editor-wc code="print('Hello component')"></editor-wc>
    <script src="./bundle.js"></script>
```

### JavaScript bundle
The latest version of the [JavaScript bundle](https://editor-images-staging.s3.eu-west-2.amazonaws.com/bundle.js) is currently available from the `editor-images-staging` S3 bucket, although this location may change as we formalise the deployment process and bundle versioning.

### Web component test page
There is a [test page](https://editor-images-staging.s3.eu-west-2.amazonaws.com/index.html) in the `editor-images-staging` bucket demonstrating the use of the web component in a host page.

## Editor Web Component Custom Events

Whilst the web component can be referred to using `document.querySelector('editor-wc')` and its attributes inspected in the same way as a standard HTML element, the element returned from such a query will have no children. This is because the editor is isolated within a shadow DOM that is not accessible to the host page. To counter this, the editor web component provides a number of custom events which may be subscribed to by the host page and these are the primary means of communication from the editor to the host.

### `codeChanged`
The `codeChanged` event is fired whenever the user makes a change to their code in the editor.

### `runStarted`
The `runStarted` event fires when the user triggers a code run in the editor.

### `runCompleted`
The `runCompleted` event fires when a code run in the editor terminates. This includes the cases where an error is thrown or the code run is interrupted by the user. The `runCompleted` event also sends data to the host page related to the code run that has just terminated as follows:

- `isErrorFree` - `false` if the code run ends with an error, including if the code run is interrupted by the user, otherwise `true`
- `duration` - the time taken in seconds for the code run to complete; `null` if the `sense_hat` library has not been imported since the timer is part of the flight hardware simulator
- `noInputEvents` - `false` if the code run used `input()` or waited for either motion or sense stick events, otherwise `true`
- `readHumidity` - `true` if the code run read the humidity, otherwise `false`
- `readPressure` - `true` if the code run read the pressure, otherwise `false`
- `readTemperature` - `true` if the code run read the temperature, otherwise `false`
- `usedLEDs` - `true` if the code run used the LED display, otherwise `false`

This data can be accessed in the event listener via `e.details` where `e` is the `runCompleted` event. Note that the booleans relating to whether certain constructions have been used in the code are set when the related `skulpt` functions are called during the code run. This avoids the brittleness associated with parsing the user's code, but relies on the user running their code for the criteria to be set.

See the [test page](https://editor-images-staging.s3.eu-west-2.amazonaws.com/index.html) for examples of how the host page can listen to these custom events and access the associated data.
