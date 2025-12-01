import { spawn } from 'node:child_process'
import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

// Always instrument the build for coverage and ensure Playwright can launch.
process.env.COVERAGE = 'true'
// Put Playwright browsers inside the project so CI without sudo/system cache still works.
const playwrightCache = process.env.PLAYWRIGHT_BROWSERS_PATH ||
  join(process.cwd(), 'node_modules', '.cache', 'ms-playwright')
process.env.PLAYWRIGHT_BROWSERS_PATH = playwrightCache
const sanitizedEnv = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: playwrightCache }
delete sanitizedEnv.ELECTRON_RUN_AS_NODE
delete process.env.ELECTRON_RUN_AS_NODE

const run = (cmd, args, opts = {}) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, { stdio: 'inherit', shell: false, env: sanitizedEnv, ...opts })
  child.on('exit', code => (code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`))))
  child.on('error', reject)
})

const hasPlaywright = async () => {
  try {
    await run('npx', ['playwright', '--version'], { timeout: 30000 })
    return true
  } catch (error) {
    console.warn('Skipping e2e tests because Playwright is unavailable or failed to verify.')
    console.warn(error.message || error)
    return false
  }
}

const ensureBrowser = async () => {
  // Download Chromium to the project cache if it's missing.
  if (!existsSync(playwrightCache)) {
    await run('npx', ['playwright', 'install', 'chromium'])
  }
}

const seedNycFromVitest = async () => {
  const vitestCoverage = join(process.cwd(), 'coverage', 'coverage-final.json')
  if (existsSync(vitestCoverage)) {
    const nycOutputDir = join(process.cwd(), '.nyc_output')
    await mkdir(nycOutputDir, { recursive: true })
    await copyFile(vitestCoverage, join(nycOutputDir, 'vitest.json'))
  }
}

if (await hasPlaywright()) {
  await ensureBrowser()
  await run('rimraf', ['.nyc_output/*'], { shell: true })
  await seedNycFromVitest()
  await run('npx', ['playwright', 'test'])
  await run('npx', ['nyc', 'report', '--reporter', 'text-summary', '--reporter', 'json-summary'])
}
