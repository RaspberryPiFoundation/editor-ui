# Mission Zero Handover

## Introduction

The python editor has been bundled into a web component for use in Mission Zero. The content of the editor web component is isolated within a shadow DOM that is not accessible to the host page and is unaffected by its styling.

## Setup

The web component can be embedded on a host page using `<editor-wc>` tags and by including the associated JavaScript bundle in a `<script>` tag on the page. The initial code to be shown in the editor is passed as an attribute to the `<editor-wc>` element. For example:
```html
    <editor-wc code="print('Hello component')"></editor-wc>
    <script src="./bundle.js"></script>
```

### JavaScript bundle
The latest version of the [JavaScript bundle](https://editor-images-staging.s3.eu-west-2.amazonaws.com/bundle.js) is currently available from the `editor-images-staging` S3 bucket, although this location may change as we formalise the deployment process and bundle versioning.

### Web component test page
There is a [test page](https://editor-images-staging.s3.eu-west-2.amazonaws.com/index.html) in the `editor-images-staging` S3 bucket demonstrating the use of the web component in a host page.


