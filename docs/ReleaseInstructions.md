Creating a new svg-edit release
============

## Update the main project

  1. Update the VERSION variable in Makefile.
  2. Update the CHANGES file with a summary of all changes.
  3. Commit these changes with `git commit -m "Updating Makefile and CHANGES for release X.Y"`.

The above steps can be done on a fork and committed via a pull request.

## Create the release binaries

  1. Ensure you are on the `master` branch with `git checkout master`.
  2. From the root directory run `make`.
  3. Copy `build/svg-edit-X.Y/`, `build/svg-edit-X.Y-src.tar.gz`, and `build/svg-edit-X.Y.zip` to a temporary directory.
  4. Switch to the `gh-pages` branch with `git checkout gh-pages`.
  5. Copy the `svg-edit-X.Y` directory to `releases/svg-edit-X.Y`.
  6. Commit these changes with `git commit -m "Updating binary files for release X.Y"`.
  7. Switch back to the `master` branch with `git checkout master`.
  8. Ensure this step worked by visiting https://svgedit.github.io/svgedit/releases/svg-edit-X.Y/svg-editor.html

The above steps can be done on a fork and committed via a pull request.

## Create the release on GitHub

  1. Go to `https://github.com/SVG-Edit/svgedit/releases` and select `Draft a new release`.
  2. Make the release target point at the commit where the makefile and changes were updated.
  3. Write a short description of the release and include a link to the live version:
     https://svgedit.github.io/svgedit/releases/svg-edit-X.Y/svg-editor.html
  4. Attach the `svg-edit-X.Y-src.tar.gz` and `build/svg-edit-X.Y.zip` files to the release.
  5. Create the release!

You will need to be a member of the SVGEdit GitHub group to do this step.

## Update the project docs

  Update `README.md` with references and links to the shiny new release.
