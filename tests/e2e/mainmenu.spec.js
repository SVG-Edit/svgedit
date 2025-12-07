import { test, expect } from './fixtures.js'

test.describe('Main menu logic', () => {
  test('saves properties, preferences and export settings', async ({ page }) => {
    await page.addInitScript(() => {
      window.__svgEditorReadyResolved = false
      window.__svgEditorReady = new Promise((resolve) => {
        document.addEventListener('svgedit:ready', (e) => {
          window.__svgEditor = e.detail
          window.__svgEditorReadyResolved = true
          resolve()
        }, { once: true })
      })
    })

    await page.goto('/index.html')
    await page.waitForFunction(() => window.__svgEditorReadyResolved === true)

    const result = await page.evaluate(() => {
      const MainMenu = window.__svgEditor.mainMenu.constructor
      window.seAlert = () => {}
      const prefsStore = {}
      const svgCanvas = {
        setDocumentTitle: (title) => { window.__title = title },
        setResolution: (w, h) => { window.__resolution = [w, h]; return true },
        getResolution: () => ({ w: 640, h: 480 }),
        getDocumentTitle: () => 'Existing',
        setConfig: (cfg) => { window.__setConfig = cfg },
        exportPDF: () => { window.__pdf = true },
        rasterExport: () => { window.__raster = true }
      }

      const editor = {
        configObj: {
          pref: (key, val) => {
            if (val !== undefined) prefsStore[key] = val
            return prefsStore[key]
          },
          curConfig: {
            baseUnit: 'px',
            gridSnapping: false,
            snappingStep: 10,
            gridColor: '#fff',
            showRulers: false,
            canvasName: 'test'
          },
          curPrefs: { bkgd_color: '#fff' },
          preferences: false
        },
        setBackground: (color, url) => { window.__bg = { color, url } },
        rulers: { updateRulers: () => { window.__rulers = true } },
        svgCanvas,
        updateCanvas: () => { window.__updated = true },
        i18next: { t: (key) => key },
        docprops: false,
        exportWindowCt: 0,
        customExportPDF: false,
        customExportImage: false,
        exportWindowName: ''
      }

      const holder = document.getElementById('menu-test-root') || (() => {
        const div = document.createElement('div')
        div.id = 'menu-test-root'
        document.body.append(div)
        return div
      })()
      holder.innerHTML =
        '<div id="se-img-prop"></div><div id="se-edit-prefs"></div>'
      const menu = new MainMenu(editor)
      menu.showDocProperties()
      menu.hideDocProperties()
      const savedDocProps = menu.saveDocProperties({
        detail: { title: 'New', w: 100, h: 200, save: 'content' }
      })

      menu.showPreferences()
      menu.savePreferences({
        detail: {
          lang: 'en',
          bgcolor: '#000',
          bgurl: 'url',
          gridsnappingon: true,
          gridsnappingstep: 5,
          gridcolor: '#ccc',
          showrulers: true,
          baseunit: 'cm'
        }
      })
      menu.hidePreferences()
      menu.clickExport({ detail: { trigger: 'ok', imgType: 'PNG', quality: 80 } })
      window.seAlert?.('alert text')
      window.seConfirm?.('question?', ['Yes', 'No'])
      window.sePrompt?.('prompt me', 'defaults')
      window.seSelect?.('pick', ['a', 'b'])

      return {
        docDialogState: document.getElementById('se-img-prop').getAttribute('dialog'),
        docSavePref: prefsStore.img_save,
        resolution: window.__resolution,
        updated: window.__updated,
        prefsDialogState: document.getElementById('se-edit-prefs').getAttribute('dialog'),
        gridColor: editor.configObj.curConfig.gridColor,
        rulersUpdated: window.__rulers === true,
        rasterCalled: window.__raster === true,
        savedDocProps
      }
    })

    expect(result.docDialogState).toBe('close')
    expect(result.docSavePref).toBe('content')
    expect(result.resolution).toEqual([100, 200])
    expect(result.updated).toBe(true)
    expect(result.prefsDialogState).toBe('close')
    expect(result.gridColor).toBe('#ccc')
    expect(result.rulersUpdated).toBe(true)
    expect(result.rasterCalled).toBe(true)
    expect(result.savedDocProps).toBe(true)
  })
})
