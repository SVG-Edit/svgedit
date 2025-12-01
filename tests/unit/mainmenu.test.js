import { beforeEach, describe, expect, it, vi } from 'vitest'

import MainMenu from '../../src/editor/MainMenu.js'

vi.mock('@svgedit/svgcanvas', () => ({
  default: {
    $id: (id) => document.getElementById(id),
    $click: (el, fn) => el?.addEventListener('click', fn),
    convertUnit: (val) => Number(val),
    isValidUnit: (_attr, val) => val !== 'bad'
  }
}))

vi.mock('@svgedit/svgcanvas/common/browser.js', () => ({
  isChrome: () => false
}))

describe('MainMenu', () => {
  let editor
  let menu
  let prefStore

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="app"></div>
      <div id="se-export-dialog"></div>
      <div id="se-img-prop"></div>
      <div id="se-edit-prefs"></div>
    `
    prefStore = { img_save: 'embed', lang: 'en' }
    const configObj = {
      curConfig: {
        baseUnit: 'px',
        exportWindowType: 'new',
        canvasName: 'svg-edit',
        gridSnapping: false,
        snappingStep: 1,
        gridColor: '#ccc',
        showRulers: false
      },
      curPrefs: { bkgd_color: '#fff' },
      preferences: false,
      pref: vi.fn((key, val) => {
        if (val !== undefined) {
          prefStore[key] = val
        }
        return prefStore[key]
      })
    }
    const svgCanvas = {
      setDocumentTitle: vi.fn(),
      setResolution: vi.fn().mockReturnValue(true),
      getResolution: vi.fn(() => ({ w: 120, h: 80 })),
      getDocumentTitle: vi.fn(() => 'Doc'),
      setConfig: vi.fn(),
      rasterExport: vi.fn().mockResolvedValue('data-uri'),
      exportPDF: vi.fn()
    }

    editor = {
      configObj,
      svgCanvas,
      i18next: { t: (key) => key },
      $svgEditor: document.getElementById('app'),
      docprops: false,
      rulers: { updateRulers: vi.fn() },
      setBackground: vi.fn(),
      updateCanvas: vi.fn(),
      customExportPDF: false,
      customExportImage: false
    }
    globalThis.seAlert = vi.fn()
    menu = new MainMenu(editor)
  })

  it('rejects invalid doc properties and shows an alert', () => {
    const result = menu.saveDocProperties({
      detail: { title: 'Oops', w: 'bad', h: 'fit', save: 'embed' }
    })
    expect(result).toBe(false)
    expect(globalThis.seAlert).toHaveBeenCalled()
    expect(editor.svgCanvas.setResolution).not.toHaveBeenCalled()
  })

  it('saves document properties and hides the dialog', () => {
    editor.docprops = true
    const result = menu.saveDocProperties({
      detail: { title: 'Demo', w: '200', h: '100', save: 'layer' }
    })

    expect(result).toBe(true)
    expect(editor.svgCanvas.setDocumentTitle).toHaveBeenCalledWith('Demo')
    expect(editor.svgCanvas.setResolution).toHaveBeenCalledWith('200', '100')
    expect(editor.updateCanvas).toHaveBeenCalled()
    expect(prefStore.img_save).toBe('layer')
    expect(editor.docprops).toBe(false)
    expect(document.getElementById('se-img-prop').getAttribute('dialog')).toBe('close')
  })

  it('saves preferences, updates config and alerts when language changes', async () => {
    editor.configObj.preferences = true
    const detail = {
      lang: 'fr',
      bgcolor: '#111',
      bgurl: '',
      gridsnappingon: true,
      gridsnappingstep: 2,
      gridcolor: '#333',
      showrulers: true,
      baseunit: 'cm'
    }

    await menu.savePreferences({ detail })

    expect(editor.setBackground).toHaveBeenCalledWith('#111', '')
    expect(prefStore.lang).toBe('fr')
    expect(editor.configObj.curConfig.gridSnapping).toBe(true)
    expect(editor.configObj.curConfig.snappingStep).toBe(2)
    expect(editor.configObj.curConfig.gridColor).toBe('#333')
    expect(editor.configObj.curConfig.showRulers).toBe(true)
    expect(editor.configObj.curConfig.baseUnit).toBe('cm')
    expect(editor.rulers.updateRulers).toHaveBeenCalled()
    expect(editor.svgCanvas.setConfig).toHaveBeenCalled()
    expect(editor.updateCanvas).toHaveBeenCalled()
    expect(globalThis.seAlert).toHaveBeenCalled()
    expect(editor.configObj.preferences).toBe(false)
  })

  it('opens doc properties dialog and converts units when needed', () => {
    editor.configObj.curConfig.baseUnit = 'cm'
    menu.showDocProperties()

    const dialog = document.getElementById('se-img-prop')
    expect(editor.docprops).toBe(true)
    expect(dialog.getAttribute('dialog')).toBe('open')
    expect(dialog.getAttribute('width')).toBe('120cm')
    expect(dialog.getAttribute('height')).toBe('80cm')
    expect(dialog.getAttribute('title')).toBe('Doc')

    editor.svgCanvas.getResolution.mockClear()
    menu.showDocProperties()
    expect(editor.svgCanvas.getResolution).not.toHaveBeenCalled()
  })

  it('opens preferences dialog only once and populates attributes', () => {
    editor.configObj.curConfig.gridSnapping = true
    editor.configObj.curConfig.snappingStep = 4
    editor.configObj.curConfig.gridColor = '#888'
    editor.configObj.curPrefs.bkgd_color = '#ff00ff'
    editor.configObj.pref = vi.fn((key) => key === 'bkgd_url' ? 'http://example.com' : prefStore[key])

    menu.showPreferences()
    const prefs = document.getElementById('se-edit-prefs')
    expect(editor.configObj.preferences).toBe(true)
    expect(prefs.getAttribute('dialog')).toBe('open')
    expect(prefs.getAttribute('gridsnappingon')).toBe('true')
    expect(prefs.getAttribute('gridsnappingstep')).toBe('4')
    expect(prefs.getAttribute('gridcolor')).toBe('#888')
    expect(prefs.getAttribute('canvasbg')).toBe('#ff00ff')
    expect(prefs.getAttribute('bgurl')).toBe('http://example.com')

    editor.configObj.preferences = true
    prefs.removeAttribute('dialog')
    menu.showPreferences()
    expect(prefs.getAttribute('dialog')).toBeNull()
  })

  it('routes export actions based on dialog detail', async () => {
    await menu.clickExport()
    expect(editor.svgCanvas.rasterExport).not.toHaveBeenCalled()

    await menu.clickExport({ detail: { trigger: 'ok', imgType: 'PNG', quality: 50 } })
    expect(editor.svgCanvas.rasterExport).toHaveBeenCalledWith('PNG', 0.5, editor.exportWindowName)
    expect(editor.exportWindowCt).toBe(1)

    await menu.clickExport({ detail: { trigger: 'ok', imgType: 'PDF' } })
    expect(editor.svgCanvas.exportPDF).toHaveBeenCalled()
  })

  it('creates menu entries and wires click handlers in init', () => {
    menu.init()

    document.getElementById('tool_export').dispatchEvent(new Event('click', { bubbles: true }))
    expect(document.getElementById('se-export-dialog').getAttribute('dialog')).toBe('open')

    document.getElementById('tool_docprops').dispatchEvent(new Event('click', { bubbles: true }))
    expect(editor.docprops).toBe(true)

    const prefsDialog = document.getElementById('se-edit-prefs')
    prefsDialog.dispatchEvent(new CustomEvent('change', { detail: { dialog: 'closed' } }))
    expect(prefsDialog.getAttribute('dialog')).toBe('close')
  })
})
