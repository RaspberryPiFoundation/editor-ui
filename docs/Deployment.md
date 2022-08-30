# Issues with deployment (2022-08)

* Heroku deploys do not set `PUBLIC_URL` so the web component will only work if all dependent JS/Python files are hosted in the same URL path as the component bundle itself.
* S3 deploys *do* set `PUBLIC_URL` so the web component knows where its stuff is (on S3) and references it appropriately.
* S3 deploys are in to subdirectories, e.g. `/previews/my-branch`, but the main editor interface assumes it is mounted at the root `/` of the URL space, and as such it doesn't seem to work.  Heroku deploys work fine in this regard.
* Caching: at the moment none of the assets are processed by webpack to add cache-busting hashes to their filename.  This means that if we serve assets from the same path after making changes to them, the client browser might not use the most up-to-date version (until the cache expires).


