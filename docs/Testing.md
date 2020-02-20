# Testing

## Building docs

This may be useful during testing. Build through `npm run build-docs`.

To start a server and open already built docs, use `npm run open-docs` (or
`npm run open-docs-no-start` if you already have a `start` process
running in another terminal tab).

Or to build *and* open the docs, use `npm run build-and-open-docs` (or
`npm run build-and-open-docs-no-start` if you already have a `start` process
running in another terminal tab).

## Scripts for running after dependency changes

1. Copying files. Some `devDependencies` are incorporated into the svgedit
    repository (and npm package) so that Github or npm hosting services
    can run (without needing to take the much heavier step of bundling all of
    `node_modules`).
    1. `npm run copy`
1. Checking licenses - If updating a dependency or devDependency,
    the project's aggregate license information might change. To get
    this information updated, run:
    1. `npm run license-badges` (Which runs the following commands)
        1. `npm run license-badge` (Only build the license badge containing
            info on this project's license(s) and those of any `dependencies`,
            and the `devDependencies` which are being bundled into the
            repository/npm package.)
        1. `npm run license-badge-dev` (Only build the license badge for this
            project's `devDependencies`. This is probably not of great concern
            unless a project is restrictive in terms of usage--i.e., if a
            dependency is not what is typically considered "open" source.)

(Note that the test and coverage badges are generated automatically during
testing to ensure they are up to date, so you should not need to call those
scripts directly.)

## Miscellaneous scripts

1. `npm run compress-images` - Compressing images is not part of other
    preparation routines, as it is time-consuming and should not need
    to be done frequently.
1. `npm run remark` - For linting Markdown. Not of high enough priority
    currently to put into an automated routine.
1. `npm run eslint` and `npm run eslint-fix` - For linting (or fixing)
    linting errors. The non-fix version will be run automatically during
    testing.
1. `npm run prep` - Run during `npm test` but may be useful to run
    `npm run prep` as needed if normally testing through
    `npm run test-only` which doesn't do the preparation. Composed of:
    1. `npm run prep-no-core-rollup`
        1. `npm run eslint` (see above)
        1. `npm run build-html` - Copies ESM HTML pages, replacing references
            to ESM scripts to compiled/rolled up scripts.
        1. `npm run build-by-config` - Runs the Rollup routines for
            compiling just the ESM-based config files (since the user
            config files are responsible for importing svgedit, one must
            compile these to get a non-ESM build, but with the advantage
            of avoiding globals and extra script tags).
    1. `npm run rollup` - Runs the rollup routine for compiling the ESM-based
        svgedit source files.

## Opening SVG editor from command line

It can be helpful to experiment with an editor by opening it from the command
line, even when automated tests already exist for a type of editor.

1. Opening the ESM editor with only the default extensions:
    1. `npm run open` OR
    1. `npm run open-no-start` if you already have a `start`
        process running in another terminal tab.
1. Opening the ESM editor with all extensions (no automated tests currently):
    1. `npm run open-all-ext` OR
    1. `npm run open-all-ext-no-start` if you already have a `start`
        process running in another terminal tab.
1. Opening an embedded (ESM) editor (no automated tests currently) (Note
    that there is currently no build process for creating a non-ESM
    embedded editor).
    1. `npm run open-embedded` (This runs the normal `start` and also
        `start-allow-origin` for running a separate server on a different
        origin (a different port) so the embedded API can be tested
        across origins.) OR
    1. `npm run open-embedded-no-start` if you already have a `start`
        process running in another terminal tab.
1. Opening an editor which is already pre-compiled (rolled up) and safe
    for older non-ESM browsers (or for better performance in ESM browsers
    as well, due to its use of fewer HTTP requests). This is the version
    most likely to be used in production environments. However, this is
    less convenient during normal debugging, as it requires that the
    lengthier `prep` script be run first (these scripts do not do so
    for you in case you are directly working on the compiled files,
    though this is not recommended).
    1. `npm run open-compiled` OR
    1. `npm run open-compiled-no-start` if you already have a `start`
        process running in another terminal tab.

## Reading/Opening test coverage reports

For testing coverage reports (see "Testing"), you can open the HTML-based
reports that are generated during the testing process (or when running
`npm run instrument` directly) from the command line into your
browser by the following commands:

1. Reading reports from the command line
    1. `npm run report` (with some line numbers but not all lines as
        with the HTML report) OR
    1. `npm run report-summary` (no line numbers--only a summary)
1. Opening HTML-based test coverage report (indicating coverage status
    for all lines)
    1. `npm run open-cov` OR
    1. `npm run open-cov-no-start` if you already have a `start`
        process running in another terminal tab.

## Testing

For ensuring tests are passing (and optionally checking coverage).

You will most likely just need to use the top-level routines, but
the components are explained here for reference.

1. `npm test`. Headless testing comprised of:
    1. `npm run instrument` - You can call this alone if you don't
        actually wish to test but wish to get the files instrumented.
        Should normally not be needed alone.
    1. `npm run test-no-cov` - You can run this alone if you have already
        run `npm run instrument` upon making changes. Should normally
        not be run alone.
        1. `npm run prep` (see above)
        1. `npm run test-only` - Includes a separate `report` step or
            otherwise the tests will not show the results visibly on the
            command line. This may be useful if you've instrumented and
            run preparation steps after any code modifications, but just
            need to re-run tests (e.g., if one did not complete them for
            some reason). See also `test-no-cov-no-core-rollup`.
            1. `npm run test-only-no-report` - Should not be needed alone.
                1. `npm start` - Starts the server
                1. `npm run cypress:run` - Runs Cypress tests (`cypress run`).
                    `cypress:run` is made of subroutines which also merge
                    Mocha results (since Cypress produces separate files)
                    and updates the testing and coverage badges.
            1. `npm run report` (see above)
1. `npm run test-no-core-rollup` - This applies the same headless testing
    steps as `npm test` minus the time-consuming `npm run rollup`. This
    script may be useful if you are only modifying config files but not
    svgedit core.
    1. `instrument` (see above)
    1. `npm run test-no-cov-no-core-rollup`. As with `test-no-cov` but no
        `npm run rollup` routine (part of `prep`).
1. `open-tests` (also as `cypress:open`)
    1. `npm start`
    1. `cypress:open-no-start`. Runs `cypress open`, the headed mode. Useful
        for testing single files with hot reloading.
