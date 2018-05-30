# Creating a new svg-edit release

## Update the main project
<!--
1. Update the VERSION variable in Makefile.
-->
1. Update `version` in `package.json` (and `package-lock.json` (via `npm i`)).
1. Update the CHANGES file with a summary of all changes.
1. Update the README references to `svg-edit.github.io` to point to the
  current version (note that it will not be available until the steps below).
1. Commit these changes
<!-- with `git commit -m "Updating Makefile and CHANGES for release X.Y"`-->.
1. Tag the version, prefixed by "v", e.g., `v3.0.1`.

The above steps can be done on a fork and committed via a pull request.

## Create the release on `gh-pages`
<!--
2. From the root directory run `make`.
3. Copy `build/svg-edit-X.Y/`, `build/svg-edit-X.Y-src.tar.gz`, and `build/svg-edit-X.Y.zip` to a temporary directory.
-->

1. Ensure you are on the `master` branch with `git checkout master`.
1. Switch to the `gh-pages` branch with `git checkout gh-pages`.
1. Copy the `svg-edit-X.Y` directory to `releases/svg-edit-X.Y` (minus
  `.git` and `.gitignore` and including the working built
  `svgedit-config-es.js` and `svgedit-config-iife.js` files).
1. Commit these changes with `git commit -m "Updating files for release X.Y"`.
1. Switch back to the `master` branch with `git checkout master`.
1. Ensure this step worked by visiting <https://svgedit.github.io/svgedit/releases/svg-edit-X.Y/svg-editor.html>
  (and in an ES6-Module-compliant browser,
  <https://svgedit.github.io/svgedit/releases/svg-edit-X.Y/svg-editor-es.html>).

The above steps can be done on a fork and committed via a pull request.

## Create the release on GitHub
<!--
4. Attach the `svg-edit-X.Y-src.tar.gz` and `build/svg-edit-X.Y.zip` files to the release.
-->
1. Go to <https://github.com/SVG-Edit/svgedit/releases> and select
  `Draft a new release`.
1. Make the release target point at the commit where the <!-- makefile and -->
  changes were updated.
1. Write a short description of the release and include a link to the live
  version:
  <https://svgedit.github.io/svgedit/releases/svg-edit-X.Y/svg-editor.html>.
  See the previous releases for the format.
1. Create the release!

You will need to be a member of the SVG-Edit GitHub group to do this step.

## Publish to npm

1. `npm publish`

## Update the project docs

Update `README.md` with references and links to the shiny new release.
