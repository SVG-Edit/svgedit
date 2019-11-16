# Creating a new svg-edit release

## Prepare

1. `npm run browser-test` - Ensure build steps occur and tests are passing
1. `npm start` and in another console window, `npm test` - This should
    also be run, though currently accessibility tests are failing.
1. `npm run build-docs` - Ensure JSDoc can build and is available for site
    build (though not added to `master`, will be copied over in `gh-pages`
    steps and used in `npm publish` step).
1. `npm pack --dry-run` to preview which files will be included once
    published and taking into account `.npmignore`.

## Update the main project
<!--
1. Update the VERSION variable in Makefile.
-->
1. Update `version` in `package.json` (and `package-lock.json` (via `npm i`)).
1. Update the CHANGES file with a summary of all changes.
1. Add new release info to `Recent news` section in README
1. Commit these changes
<!-- with `git commit -m "Updating Makefile and CHANGES for release X.Y.Z"`-->.
1. Tag the version, prefixed by "v", e.g., `v5.1.0`.

The above steps can be done on a fork and committed via a pull request.

## Create the release on `gh-pages`
<!--
2. From the root directory run `make`.
3. Copy `build/svg-edit-X.Y.Z/`, `build/svg-edit-X.Y.Z-src.tar.gz`, and `build/svg-edit-X.Y.Z.zip` to a temporary directory.
-->

1. Switch to the `gh-pages` branch with `git checkout gh-pages`.
1. Run the `build.js` executable (`npm run build` if within the project root
    directory); **Please note: this script is only available on `gh-pages` and
    currently assumes that one has the `gh-pages` branch checked out within
    a folder that is in a sibling directory to a folder named `svgedit` that
    is on the `master` branch and whose files and version info will be copied
    over to `gh-pages` in making the "latest" and specific version builds**
1. Commit these changes with `git commit -m "Updating files for release X.Y.Z"`.
1. Switch back to the `master` branch with `git checkout master`.
1. Ensure this step worked by visiting
    <https://svg-edit.github.io/svgedit/releases/svg-edit-X.Y.Z/editor/svg-editor.html>
    (and in an ES6-Module-compliant browser,
    <https://svg-edit.github.io/svgedit/releases/svg-edit-X.Y.Z/editor/svg-editor-es.html>).

The above steps can be done on a fork and committed via a pull request.

## Create the release on GitHub
<!--
4. Attach the `svg-edit-X.Y.Z-src.tar.gz` and `build/svg-edit-X.Y.Z.zip` files to the release.
-->
1. Go to <https://github.com/SVG-Edit/svgedit/releases> and select
  `Draft a new release`.
1. Make the release target point at the tag where the <!-- makefile and -->
  changes were updated.
1. Write a short description of the release and include a link to the live
  version (in another tab, you may wish to see the source for a previous
  release):
  <https://svg-edit.github.io/svgedit/releases/svg-edit-X.Y.Z/editor/svg-editor.html>.
1. Create the release!

You will need to be a member of the SVG-Edit GitHub group to do this step.

## Publish to npm

1. `npm publish`

You will need to be a member of the npm group to do this step.
