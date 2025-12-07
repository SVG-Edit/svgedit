# Creating a new svg-edit release

## Prepare
1. `npm test` - Must pass before version bump (accessibility tests are currently failing; address or accept the known failure before proceeding).
1. `npm run build` - Must pass before version bump; builds all workspaces and the main editor from the root.

## Update the main project

1. Run `npm run version-bump` (after tests/builds are green) to bump the root and all workspace package versions together and refresh `package-lock.json`.
1. Update the `CHANGES.md` file with a summary of all changes (adding the version of the new release).

## Publish to npm

1. From the repo root, run `npm run publish`. The script will:
    - Confirm the version bump is already done.
    - Confirm `CHANGES.md` has been updated.
    - Run the full release checks (`npm run test-build` → tests, docs, and build); it exits on failure.
    - Ask before creating a release commit and tag (defaults to `v<version>`); declining aborts the publish.
    - Publish all workspaces and the root package together.

You will need to be a member of the npm group to do this step.

