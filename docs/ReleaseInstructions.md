# Creating a new svg-edit release

## Prepare

1. `npm run browser-test` - Ensure build steps occur and tests are passing
1. `npm start` and in another console window, `npm test` - This should
    also be run, though currently accessibility tests are failing.
1. `npm run build-docs` - Ensure JSDoc can build and is available for site
    build (though not added to `master`, will be copied over in
    the `SVG-Edit.github.io` steps and used in `npm publish` step).
1. `npm pack --dry-run` to preview which files will be included once
    published and taking into account `.npmignore`.

## Update the main project

1. Update `version` in `package.json` (and `package-lock.json` (via `npm i`)).
1. Update the CHANGES file with a summary of all changes.
1. Add new release info to `Recent news` section in README
1. Commit these changes `git commit -m "Updating CHANGES for release X.Y.Z"`-->.
1. Tag the version, prefixed by "v", e.g., `v6.0.0`.

The above steps can be done on a fork and committed via a pull request.

## Create the release as a submodule

1. Create a branch for the release, e.g., `git branch release-v6.0.0`
1. While still on `master`, add the branch to `.gitsubmodules`:
    `VERSION=6.0.0 npm run add-release`

1. Run `git submodule update --init --recursive`
1. Commit these changes `git commit -m "Updating for release X.Y.Z"`-->.
1. Push to `master`.
1. Ensure the new release is available by visiting
    <https://svg-edit.github.io/svgedit/releases/svg-edit-X.Y.Z/editor/svg-editor.html>
    (and in an ES6-Module-compliant browser,
    <https://svg-edit.github.io/svgedit/releases/svg-edit-X.Y.Z/editor/svg-editor-es.html>).

## Create the release on GitHub

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

You will need to be a member of the npm group to do this step. You can run
`npm publish --dry-run` to confirm that the files being included are all desired,
and add to `.npmignore` if not.
