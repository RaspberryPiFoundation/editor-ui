# Python Dependencies

## Skulpt and p5

The editor uses [Skulpt](https://skulpt.org/) to run Python code in the browser.

Skulpt allows users to import a number of common Python modules but lacks support for many libraries, including the p5 collection of drawing tools.

To enable p5 within Skulpt, the editor initially imported p5.js as a script, then used shims to make it compatible with Skulpt.

## Inaccessible Shadow DOM

p5.js updates DOM elements via calls to the `document` object. The WebComponent, however, encapsulates those elements within a Shadow DOM, which is inaccessible to the p5 library when loaded as a script.

The current solution is to provide a [customised version](../public/libraries/processing/p5/p5.js) of the entire p5.js library that checks whether it needs to update the `document` or the `shadowRoot`.

[p5-shim.js](../public/shims/processing/p5/p5-shim.js) performs a similar check.

This allows both the WebComponent and standalone editors to use p5.

## Maintainance problems

The custom library works but raises a number of issues: principally, providing a custom implementation of p5.js makes it harder to maintain updates to that library.

Further work is needed to determine if we can import the script as before (rather than provide a customised version of the entire library) then redirect it to the `shadowroot` when needed.

That work may also assess whether Skulpt itself should be replaced with a tool that allows more flexible support for Python libraries.

## Supported libraries

The editor requires access to a number of libraries that Skulpt does not support. They may be affected by similar issues.

The libraries are:

- p5
- py5
- pygal
- sense_hat
- turtle
