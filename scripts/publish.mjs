#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import readline from 'node:readline'

const rootDir = process.cwd()
const rootPackagePath = join(rootDir, 'package.json')
const packageLockPath = join(rootDir, 'package-lock.json')
const changesPath = join(rootDir, 'CHANGES.md')

function readJson (path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

async function prompt (question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const answer = await new Promise(resolve => rl.question(question, resolve))
  rl.close()
  return answer.trim()
}

function expandWorkspaces (patterns) {
  const expanded = []
  for (const pattern of patterns) {
    if (!pattern.includes('*')) {
      expanded.push(pattern)
      continue
    }
    const [prefix, suffix] = pattern.split('*')
    const baseDir = join(rootDir, prefix || '.')
    const entries = readdirSync(baseDir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        expanded.push(join(prefix, entry.name, suffix))
      }
    }
  }
  return expanded
}

function loadWorkspacePackagePaths () {
  const rootPackage = readJson(rootPackagePath)
  const workspacePatterns = Array.isArray(rootPackage.workspaces)
    ? rootPackage.workspaces
    : rootPackage.workspaces?.packages ?? []
  return expandWorkspaces(workspacePatterns).map(path => join(rootDir, path, 'package.json'))
}

function inGitRepo () {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore', cwd: rootDir })
    return true
  } catch (error) {
    return false
  }
}

function confirmYes (answer) {
  return /^y(es)?$/i.test(answer)
}

function quoteArg (value) {
  return JSON.stringify(value)
}

function run (command) {
  execSync(command, { stdio: 'inherit', cwd: rootDir })
}

async function main () {
  const rootPackage = readJson(rootPackagePath)
  const workspacePackages = loadWorkspacePackagePaths()
  const releaseVersion = rootPackage.version
  const defaultReleaseName = `v${releaseVersion}`

  console.log(`Preparing to publish ${rootPackage.name}@${releaseVersion}\n`)

  const versionBumped = await prompt(`Has the version bump been completed (current version ${releaseVersion})? [y/N]: `)
  if (!confirmYes(versionBumped)) {
    console.log('Please run version bump before publishing. Exiting.')
    process.exit(1)
  }

  const changelogUpdated = await prompt('Has CHANGES.md been updated? [y/N]: ')
  if (!confirmYes(changelogUpdated)) {
    console.log('Please update CHANGES.md before publishing. Exiting.')
    process.exit(1)
  }

  console.log('\nRunning tests, docs, and builds (test-build)...')
  try {
    run('npm run test-build')
  } catch (error) {
    console.error('Tests/builds failed. Aborting publish.')
    process.exit(1)
  }

  const doCommit = await prompt('\nCreate git commit and tag for this release before publishing? [y/N]: ')
  if (!confirmYes(doCommit)) {
    console.log('Publish aborted by user.')
    process.exit(0)
  }

  if (!inGitRepo()) {
    console.error('Git repository not detected; cannot create commit/tag.')
    process.exit(1)
  }

  const releaseNameInput = await prompt(`Release name for commit/tag (default ${defaultReleaseName}): `)
  const releaseName = releaseNameInput || defaultReleaseName

  console.log('\nCreating commit and tag...')
  const filesToStage = [
    changesPath,
    rootPackagePath,
    packageLockPath,
    ...workspacePackages
  ]
  run(`git add ${filesToStage.map(quoteArg).join(' ')}`)
  run(`git commit -m ${quoteArg(releaseName)}`)
  run(`git tag ${quoteArg(releaseName)}`)

  console.log('\nPublishing packages to npm...')
  run('npm publish --workspaces --include-workspace-root')

  console.log(`\nDone. Published ${releaseName}.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
