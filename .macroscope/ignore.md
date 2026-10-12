---
ignoreTests: false
---
**/yarn.lock
**/*.svg

# Yarn binary checked in via yarnPath in .yarnrc.yml
**/.yarn/releases/**

# Vendored third-party bundles (p5.js)
**/public/libraries/**

# Written by Crowdin (crowdin.yml); only en.json is edited by hand
**/public/translations/*-*.json

# Mock Scratch API responses (project JSON and SVG assets saved
# without extensions) served for local development
**/public/api/scratch/**
