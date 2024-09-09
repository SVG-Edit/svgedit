# Creating a new svg-edit release

## Prepare

1. `npm test` - Ensure build steps occur and tests are passing (note that
    accessibility tests are currently failing).
1. `npm publish --dry-run` to run the preparatory scripts to ensure the
    necessary files are updated and also to see which files will be
    included once published and taking into account `.npmignore`
    (use `npm pack --dry-run` to see the files without the preparatory
    steps).

## Update the main project

1. Update `version` in `package.json` (and `package-lock.json` (via `npm i`)).
1. Update the `CHANGES.md` file with a summary of all changes (adding the
    version of the new release).
1. Add new release info to `Recent news` section in README
1. For major version changes, add a separate document for that version
    to `docs/versions/X.Y.Z.md` to summarizethe changes (higher level
    than the CHANGES file) and to indicate what is needed to update code
    to work with the breaking changes.
1. Commit these changes `git commit -m "Updating CHANGES for release X.Y.Z"`-->.
1. Tag the version, prefixed by "v", e.g., `v6.0.0`.

The above steps can be done on a fork and committed via a pull request.

## Create the release as a submodule

1. Create a branch for the release, e.g., `git branch release-v6.0.0` and
    push it to origin.
1. While still on `master`, run the following (changing the version). This
    will add the branch to `.gitsubmodules` and have the current version in
    `package.json` point `latest` to this new release:
    `npm run add-new-release`; if you need to add a specific version (e.g.,
    an older one that was missing, use the following):
    `npm run add-release --release=6.0.0`. If you need to remove a release,
    run `npm run remove-release --release=6.0.0`
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

You will need to be a member of the npm group to do this step. See above
for `npm publish --dry-run`.
