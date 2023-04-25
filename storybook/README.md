# Storybook

This directory contains the config and dependencies for separate Storybook instance alongside an application.

## Getting Started

For a dev setup it's best to install all the dependencies using yarn, then run `yarn run storybook` to start a separate server for Storybook.

It should be noted that the server will load a new browser tab on the root however this has been configured on a path to allow deployment alongside the application so access is on the `/design-system` path [here](http://localhost:6006/design-system/).

## Adding Stories

Stories should be added to the `stories` directory and should mirror the apps directory structure as best as possible.

This instance of Storybook has been configured so on load `./src` is a module path. This allows for alias importing e.g. 
```
import PathwayCardList from 'components/PathwayCardList/PathwayCardList'
```
once up and running or built this import will be able to resolve itself.

Some global parameters exist in this setup such as `locale` (which uses the same i18n setup as the app) so ensure to use them wherever possible to massive control of the components.

A good approach to component stories is using templates, this is well documented [here](https://storybook.js.org/docs/react/writing-stories/args) with examples in the `./stories/components` directory.

## Deploying

This instance of Storybook is setup to generate a static build in the `../public/design-system` directory.

This can be ran using `yarn run build-storybook` in this directory and can be checked by using the yarn package `serve`, running `server ../public` and hitting the `/design-system` path.

With this setup the capability of hosting a static build in the root app is now possible and solely dependant on the app setup to do so.
