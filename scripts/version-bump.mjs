#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import readline from 'node:readline'

const rootDir = process.cwd()
const rootPackagePath = join(rootDir, 'package.json')

function readJson (path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function writeJson (path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n')
}

function parseSemver (version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim())
  if (!match) return null
  return match.slice(1).map(Number)
}

function bumpVersion (version, type) {
  const parsed = parseSemver(version)
  if (!parsed) throw new Error(`Invalid semver: ${version}`)
  const [major, minor, patch] = parsed
  if (type === 'patch') return `${major}.${minor}.${patch + 1}`
  if (type === 'minor') return `${major}.${minor + 1}.0`
  if (type === 'major') return `${major + 1}.0.0`
  throw new Error(`Unknown bump type: ${type}`)
}

function isGreaterVersion (a, b) {
  const pa = parseSemver(a)
  const pb = parseSemver(b)
  if (!pa || !pb) return false
  for (let i = 0; i < 3; i += 1) {
    if (pa[i] > pb[i]) return true
    if (pa[i] < pb[i]) return false
  }
  return false
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

async function prompt (question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  const answer = await new Promise(resolve => rl.question(question, resolve))
  rl.close()
  return answer.trim()
}

function loadPackages () {
  const rootPackage = readJson(rootPackagePath)
  const workspacePatterns = Array.isArray(rootPackage.workspaces)
    ? rootPackage.workspaces
    : rootPackage.workspaces?.packages ?? []
  const workspacePaths = expandWorkspaces(workspacePatterns)
  const workspaces = workspacePaths.map(path => {
    const packagePath = join(rootDir, path, 'package.json')
    return { path, packagePath, pkg: readJson(packagePath) }
  })
  return { rootPackage, workspaces }
}

async function chooseVersion (current) {
  const suggestions = {
    patch: bumpVersion(current, 'patch'),
    minor: bumpVersion(current, 'minor'),
    major: bumpVersion(current, 'major')
  }
  console.log('\nSuggested bumps:')
  console.log(`- patch: ${suggestions.patch}`)
  console.log(`- minor: ${suggestions.minor}`)
  console.log(`- major: ${suggestions.major}`)
  while (true) {
    const answer = await prompt(`\nNew version [p/m/M/custom] (default patch: ${suggestions.patch}): `)
    const trimmed = answer.trim()
    const lower = trimmed.toLowerCase()
    const chosen = !trimmed
      ? suggestions.patch
      : lower === 'p' || lower === 'patch'
        ? suggestions.patch
        : lower === 'm' || lower === 'minor'
          ? suggestions.minor
          : trimmed === 'M' || lower === 'major'
            ? suggestions.major
            : trimmed
    if (!parseSemver(chosen)) {
      console.log(`Invalid semver: ${chosen}. Expected format x.y.z`)
      continue
    }
    if (!isGreaterVersion(chosen, current)) {
      console.log(`Version must be greater than current (${current}).`)
      continue
    }
    return chosen
  }
}

async function main () {
  const { rootPackage, workspaces } = loadPackages()
  console.log('Current versions:')
  console.log(`- ${rootPackage.name} (root): ${rootPackage.version}`)
  for (const ws of workspaces) {
    console.log(`- ${ws.pkg.name} (${ws.path}): ${ws.pkg.version}`)
  }

  const newVersion = await chooseVersion(rootPackage.version)

  console.log(`\nUpdating all packages to ${newVersion}...`)
  rootPackage.version = newVersion
  writeJson(rootPackagePath, rootPackage)
  for (const ws of workspaces) {
    ws.pkg.version = newVersion
    writeJson(ws.packagePath, ws.pkg)
  }

  console.log('Refreshing package-lock.json...')
  execSync('npm install --package-lock-only --workspaces --include-workspace-root', {
    stdio: 'inherit',
    cwd: rootDir
  })

  console.log('\nDone.')
  console.log(`\nMake sure to update any relevant documentation and changelogs for version ${newVersion}...`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
