import { visitAndApproveStorage } from '../../support/ui-test-helper.js'

describe('Configuration Object', function () {
  beforeEach(() => {
    visitAndApproveStorage()
  })

  it('should exist with proper API', function () {
    cy.window().then(win => {
      expect(typeof win.svgEditor.configObj).to.equal('object')
      expect(typeof win.svgEditor.configObj.setConfig).to.equal('function')
    })
  })

  it('should have default config values', function () {
    cy.window().then(win => {
      const config = win.svgEditor.configObj.curConfig
      expect(config).to.be.an('object')
      // Check some essential default config values
      expect(config.dimensions).to.be.an('array')
      expect(config.initFill).to.have.property('color')
      expect(config.initStroke).to.have.property('color')
      expect(config.text).to.be.an('object')
    })
  })

  it('should allow modifying configuration values', function () {
    cy.window().then(win => {
      const configObj = win.svgEditor.configObj

      // Save original values to restore later
      const originalConfig = configObj.curConfig
      const originalDimensions = [...originalConfig.dimensions]

      // Modify a config value
      configObj.setConfig({ dimensions: [800, 600] })

      // Verify the change
      const newConfig = configObj.curConfig
      expect(newConfig.dimensions[0]).to.equal(800)
      expect(newConfig.dimensions[1]).to.equal(600)

      // Restore original value
      configObj.setConfig({ dimensions: originalDimensions })
    })
  })
})
