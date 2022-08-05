/* eslint-disable max-len */
/* globals seAlert */

import SvgCanvas from '@svgedit/svgcanvas'
import topPanelHTML from './TopPanel.html'

const { $qa, $id, $click, isValidUnit, getTypeMap, convertUnit } = SvgCanvas

/*
 * register actions for left panel
 */
/**
 *
 */
class TopPanel {
  /**
   * @param {PlainObject} editor svgedit handler
   */
  constructor (editor) {
    this.editor = editor
  }

  /**
   * @type {module}
   */
  displayTool (className) {
    // default display is 'none' so removing the property will make the panel visible
    $qa(`.${className}`).map(el => el.style.removeProperty('display'))
  }

  /**
   * @type {module}
   */
  hideTool (className) {
    $qa(`.${className}`).forEach(el => {
      el.style.display = 'none'
    })
  }

  /**
   * @type {module}
   */
  get selectedElement () {
    return this.editor.selectedElement
  }

  /**
   * @type {module}
   */
  get multiselected () {
    return this.editor.multiselected
  }

  /**
   * @type {module}
   */
  get path () {
    return this.editor.svgCanvas.pathActions
  }

  /**
   *
   * @param {Element} opt
   * @param {boolean} changeElem
   * @returns {void}
   */
  setStrokeOpt (opt, changeElem) {
    const { id } = opt
    const bits = id.split('_')
    const [pre, val] = bits

    if (changeElem) {
      this.svgCanvas.setStrokeAttr('stroke-' + pre, val)
    }
    opt.classList.add('current')
    const elements = Array.prototype.filter.call(
      opt.parentNode.children,
      function (child) {
        return child !== opt
      }
    )
    Array.from(elements).forEach(function (element) {
      element.classList.remove('current')
    })
  }

  /**
   * Updates the toolbar (colors, opacity, etc) based on the selected element.
   * This function also updates the opacity and id elements that are in the
   * context panel.
   * @returns {void}
   */
  update () {
    let i
    let len
    // set title
    $qa('#title_panel > p')[0].textContent = this.editor.title
    if (this.selectedElement) {
      switch (this.selectedElement.tagName) {
        case 'use':
        case 'image':
        case 'foreignObject':
          break
        case 'g':
        case 'a': {
          // Look for common styles
          const childs = this.selectedElement.getElementsByTagName('*')
          let gWidth = null
          for (i = 0, len = childs.length; i < len; i++) {
            const swidth = childs[i].getAttribute('stroke-width')

            if (i === 0) {
              gWidth = swidth
            } else if (gWidth !== swidth) {
              gWidth = null
            }
          }

          $id('stroke_width').value = gWidth === null ? '' : gWidth
          this.editor.bottomPanel.updateColorpickers(false)
          break
        }
        default: {
          this.editor.bottomPanel.updateColorpickers(false)

          $id('stroke_width').value =
            this.selectedElement.getAttribute('stroke-width') || 1
          $id('stroke_style').value =
            this.selectedElement.getAttribute('stroke-dasharray') || 'none'
          $id('stroke_style').setAttribute('value', $id('stroke_style').value)

          let attr =
            this.selectedElement.getAttribute('stroke-linejoin') || 'miter'

          if ($id('linejoin_' + attr)) {
            this.setStrokeOpt($id('linejoin_' + attr))
            $id('stroke_linejoin').setAttribute('value', attr)
          }

          attr = this.selectedElement.getAttribute('stroke-linecap') || 'butt'
          if ($id('linecap_' + attr)) {
            this.setStrokeOpt($id('linecap_' + attr))
            $id('stroke_linecap').setAttribute('value', attr)
          }
        }
      }
    }

    // All elements including image and group have opacity
    if (this.selectedElement) {
      const opacPerc =
        (this.selectedElement.getAttribute('opacity') || 1.0) * 100
      $id('opacity').value = opacPerc
      $id('elem_id').value = this.selectedElement.id
      $id('elem_class').value = this.selectedElement.getAttribute('class') ?? ''
    }

    this.editor.bottomPanel.updateToolButtonState()
  }

  /**
   * @param {PlainObject} [opts={}]
   * @param {boolean} [opts.cancelDeletes=false]
   * @returns {void} Resolves to `undefined`
   */
  promptImgURL ({ cancelDeletes = false } = {}) {
    let curhref = this.editor.svgCanvas.getHref(this.editor.selectedElement)
    curhref = curhref.startsWith('data:') ? '' : curhref
    const url = prompt(
      this.editor.i18next.t('notification.enterNewImgURL'),
      curhref
    )
    if (url) {
      this.setImageURL(url)
    } else if (cancelDeletes) {
      this.editor.svgCanvas.deleteSelectedElements()
    }
  }

  /**
   * Updates the context panel tools based on the selected element.
   * @returns {void}
   */
  updateContextPanel () {
    let elem = this.editor.selectedElement
    // If element has just been deleted, consider it null
    if (!elem?.parentNode) {
      elem = null
    }
    const currentLayerName = this.editor.svgCanvas
      .getCurrentDrawing()
      .getCurrentLayerName()
    const currentMode = this.editor.svgCanvas.getMode()
    const unit =
      this.editor.configObj.curConfig.baseUnit !== 'px'
        ? this.editor.configObj.curConfig.baseUnit
        : null

    const isNode = currentMode === 'pathedit'
    const menuItems = document.getElementById('se-cmenu_canvas')
    this.hideTool('selected_panel')
    this.hideTool('multiselected_panel')
    this.hideTool('g_panel')
    this.hideTool('rect_panel')
    this.hideTool('circle_panel')
    this.hideTool('ellipse_panel')
    this.hideTool('line_panel')
    this.hideTool('text_panel')
    this.hideTool('image_panel')
    this.hideTool('container_panel')
    this.hideTool('use_panel')
    this.hideTool('a_panel')
    this.hideTool('xy_panel')
    if (elem) {
      const elname = elem.nodeName

      const angle = this.editor.svgCanvas.getRotationAngle(elem)
      $id('angle').value = angle

      const blurval = this.editor.svgCanvas.getBlur(elem) * 10
      $id('blur').value = blurval

      if (
        this.editor.svgCanvas.addedNew &&
        elname === 'image' &&
        this.editor.svgCanvas.getMode() === 'image' &&
        !this.editor.svgCanvas.getHref(elem).startsWith('data:')
      ) {
        /* await */ this.promptImgURL({ cancelDeletes: true })
      }

      if (!isNode && currentMode !== 'pathedit') {
        this.displayTool('selected_panel')
        // Elements in this array already have coord fields
        if (['line', 'circle', 'ellipse'].includes(elname)) {
          this.hideTool('xy_panel')
        } else {
          let x
          let y

          // Get BBox vals for g, polyline and path
          if (['g', 'polyline', 'path'].includes(elname)) {
            const bb = this.editor.svgCanvas.getStrokedBBox([elem])
            if (bb) {
              ;({ x, y } = bb)
            }
          } else {
            x = elem.getAttribute('x')
            y = elem.getAttribute('y')
          }

          if (unit) {
            x = convertUnit(x)
            y = convertUnit(y)
          }

          $id('selected_x').value = x || 0
          $id('selected_y').value = y || 0
          this.displayTool('xy_panel')
        }

        // Elements in this array cannot be converted to a path
        if (['image', 'text', 'path', 'g', 'use'].includes(elname)) {
          this.hideTool('tool_topath')
        } else {
          this.displayTool('tool_topath')
        }
        if (elname === 'path') {
          this.displayTool('tool_reorient')
        } else {
          this.hideTool('tool_reorient')
        }
        $id('tool_reorient').disabled = angle === 0
      } else {
        const point = this.path.getNodePoint()
        $id('tool_add_subpath').pressed = false
        !this.path.canDeleteNodes
          ? $id('tool_node_delete').classList.add('disabled')
          : $id('tool_node_delete').classList.remove('disabled')

        // Show open/close button based on selected point
        // setIcon('#tool_openclose_path', path.closed_subpath ? 'open_path' : 'close_path');

        if (point) {
          const segType = $id('seg_type')
          if (unit) {
            point.x = convertUnit(point.x)
            point.y = convertUnit(point.y)
          }
          $id('path_node_x').value = point.x
          $id('path_node_y').value = point.y
          if (point.type) {
            segType.value = point.type
            segType.removeAttribute('disabled')
          } else {
            segType.value = 4
            segType.setAttribute('disabled', 'disabled')
          }
        }
        return
      }

      // update contextual tools here
      const panels = {
        g: [],
        a: [],
        rect: ['rx', 'width', 'height'],
        image: ['width', 'height'],
        circle: ['cx', 'cy', 'r'],
        ellipse: ['cx', 'cy', 'rx', 'ry'],
        line: ['x1', 'y1', 'x2', 'y2'],
        text: [],
        use: []
      }

      const { tagName } = elem

      let linkHref = null
      if (tagName === 'a') {
        linkHref = this.editor.svgCanvas.getHref(elem)
        this.displayTool('g_panel')
      }
      // siblings
      if (elem.parentNode) {
        const selements = Array.prototype.filter.call(
          elem.parentNode.children,
          function (child) {
            return child !== elem
          }
        )
        if (elem.parentNode.tagName === 'a' && !selements.length) {
          this.displayTool('a_panel')
          linkHref = this.editor.svgCanvas.getHref(elem.parentNode)
        }
      }

      // Hide/show the make_link buttons
      if (linkHref) {
        this.displayTool('tool_make_link')
        this.displayTool('tool_make_link_multi')
        $id('link_url').value = linkHref
      } else {
        this.hideTool('tool_make_link')
        this.hideTool('tool_make_link_multi')
      }

      if (panels[tagName]) {
        const curPanel = panels[tagName]
        this.displayTool(tagName + '_panel')

        curPanel.forEach(item => {
          let attrVal = elem.getAttribute(item)
          if (this.editor.configObj.curConfig.baseUnit !== 'px' && elem[item]) {
            const bv = elem[item].baseVal.value
            attrVal = convertUnit(bv)
          }
          $id(`${tagName}_${item}`).value = attrVal || 0
        })

        if (tagName === 'text') {
          this.displayTool('text_panel')
          $id('tool_italic').pressed = this.editor.svgCanvas.getItalic()
          $id('tool_bold').pressed = this.editor.svgCanvas.getBold()
          $id(
            'tool_text_decoration_underline'
          ).pressed = this.editor.svgCanvas.hasTextDecoration('underline')
          $id(
            'tool_text_decoration_linethrough'
          ).pressed = this.editor.svgCanvas.hasTextDecoration('line-through')
          $id(
            'tool_text_decoration_overline'
          ).pressed = this.editor.svgCanvas.hasTextDecoration('overline')
          $id('tool_font_family').setAttribute(
            'value',
            elem.getAttribute('font-family')
          )
          $id('tool_text_anchor').setAttribute(
            'value',
            elem.getAttribute('text-anchor')
          )
          $id('font_size').value = elem.getAttribute('font-size')
          $id('tool_letter_spacing').value =
            elem.getAttribute('letter-spacing') ?? 0
          $id('tool_word_spacing').value =
            elem.getAttribute('word-spacing') ?? 0
          $id('tool_text_length').value = elem.getAttribute('textLength') ?? 0
          $id('tool_length_adjust').value =
            elem.getAttribute('lengthAdjust') ?? 0
          $id('text').value = elem.textContent
          if (this.editor.svgCanvas.addedNew) {
            // Timeout needed for IE9
            setTimeout(() => {
              $id('text').focus()
              $id('text').select()
            }, 100)
          }
          // text
        } else if (
          tagName === 'image' &&
          this.editor.svgCanvas.getMode() === 'image'
        ) {
          this.editor.svgCanvas.setImageURL(this.editor.svgCanvas.getHref(elem))
          // image
        } else if (tagName === 'g' || tagName === 'use') {
          this.displayTool('container_panel')
          const title = this.editor.svgCanvas.getTitle()
          const label = $id('g_title')
          label.value = title
          $id('g_title').disabled = tagName === 'use'
        }
      }
      menuItems.setAttribute(
        (tagName === 'g' ? 'en' : 'dis') + 'ablemenuitems',
        '#ungroup'
      )
      menuItems.setAttribute(
        (tagName === 'g' || !this.multiselected ? 'dis' : 'en') +
          'ablemenuitems',
        '#group'
      )

      // if (elem)
    } else if (this.multiselected) {
      // Check if all selected elements are 'text' nodes, if yes enable text panel
      const selElems = this.editor.svgCanvas.getSelectedElements()
      if (selElems.every((elem) => elem.tagName === 'text')) {
        this.displayTool('text_panel')
      }

      this.displayTool('multiselected_panel')
      menuItems.setAttribute('enablemenuitems', '#group')
      menuItems.setAttribute('disablemenuitems', '#ungroup')
    } else {
      menuItems.setAttribute(
        'disablemenuitems',
        '#delete,#cut,#copy,#group,#ungroup,#move_front,#move_up,#move_down,#move_back'
      )
    }

    // update history buttons
    $id('tool_undo').disabled =
      this.editor.svgCanvas.undoMgr.getUndoStackSize() === 0
    $id('tool_redo').disabled =
      this.editor.svgCanvas.undoMgr.getRedoStackSize() === 0

    this.editor.svgCanvas.addedNew = false

    if ((elem && !isNode) || this.multiselected) {
      // update the selected elements' layer
      $id('selLayerNames').removeAttribute('disabled')
      $id('selLayerNames').value = currentLayerName
      $id('selLayerNames').setAttribute('value', currentLayerName)

      // Enable regular menu options
      const canCMenu = document.getElementById('se-cmenu_canvas')
      canCMenu.setAttribute(
        'enablemenuitems',
        '#delete,#cut,#copy,#move_front,#move_up,#move_down,#move_back'
      )
    } else {
      $id('selLayerNames').setAttribute('disabled', 'disabled')
    }
  }

  /**
   * @param {Event} [e] Not used.
   * @param {boolean} forSaving
   * @returns {void}
   */
  showSourceEditor (e, forSaving) {
    const $editorDialog = document.getElementById('se-svg-editor-dialog')
    if ($editorDialog.getAttribute('dialog') === 'open') return
    const origSource = this.editor.svgCanvas.getSvgString()
    $editorDialog.setAttribute('dialog', 'open')
    $editorDialog.setAttribute('value', origSource)
    $editorDialog.setAttribute('copysec', Boolean(forSaving))
    $editorDialog.setAttribute('applysec', !forSaving)
  }

  /**
   *
   * @returns {void}
   */
  clickWireframe () {
    $id('tool_wireframe').pressed = !$id('tool_wireframe').pressed
    this.editor.workarea.classList.toggle('wireframe')

    const wfRules = $id('wireframe_rules')
    if (!wfRules) {
      const fcRules = document.createElement('style')
      fcRules.setAttribute('id', 'wireframe_rules')
      document.getElementsByTagName('head')[0].appendChild(fcRules)
    } else {
      while (wfRules.firstChild) {
        wfRules.removeChild(wfRules.firstChild)
      }
    }
    this.editor.updateWireFrame()
  }

  /**
   *
   * @returns {void}
   */
  clickUndo () {
    const { undoMgr, textActions } = this.editor.svgCanvas
    if (undoMgr.getUndoStackSize() > 0) {
      undoMgr.undo()
      this.editor.layersPanel.populateLayers()
      if (this.editor.svgCanvas.getMode() === 'textedit') {
        textActions.clear()
      }
    }
  }

  /**
   *
   * @returns {void}
   */
  clickRedo () {
    const { undoMgr } = this.editor.svgCanvas
    if (undoMgr.getRedoStackSize() > 0) {
      undoMgr.redo()
      this.editor.layersPanel.populateLayers()
    }
  }

  /**
   * @type {module}
   */
  changeRectRadius (e) {
    this.editor.svgCanvas.setRectRadius(e.target.value)
  }

  /**
   * @type {module}
   */
  changeFontSize (e) {
    this.editor.svgCanvas.setFontSize(e.target.value)
  }

  /**
   * @type {module}
   */
  changeRotationAngle (e) {
    this.editor.svgCanvas.setRotationAngle(e.target.value)
    if (Number.parseInt(e.target.value) === 0) {
      $id('tool_reorient').classList.add('disabled')
    } else {
      $id('tool_reorient').classList.remove('disabled')
    }
  }

  /**
   * @param {PlainObject} e
   * @returns {void}
   */
  changeBlur (e) {
    this.editor.svgCanvas.setBlur(e.target.value / 10, true)
  }

  /**
   *
   * @returns {void}
   */
  clickGroup () {
    // group
    if (this.editor.multiselected) {
      this.editor.svgCanvas.groupSelectedElements()
      // ungroup
    } else if (this.editor.selectedElement) {
      this.editor.svgCanvas.ungroupSelectedElement()
    }
  }

  /**
   *
   * @returns {void}
   */
  clickClone () {
    this.editor.svgCanvas.cloneSelectedElements(20, 20)
  }

  /**
   * @param {PlainObject} evt
   * @returns {void}
   */
  clickAlignEle (evt) {
    this.editor.svgCanvas.alignSelectedElements(evt.detail.value, 'page')
  }

  /**
   * @param {string} pos indicate the alignment relative to top, bottom, middle etc..
   * @returns {void}
   */
  clickAlign (pos) {
    let value = $id('tool_align_relative').value
    if (value === '') {
      value = 'selected'
    }
    this.editor.svgCanvas.alignSelectedElements(pos, value)
  }

  /**
   *
   * @type {module}
   */
  attrChanger (e) {
    const attr = e.target.getAttribute('data-attr')
    let val = e.target.value
    const valid = isValidUnit(attr, val, this.selectedElement)

    if (!valid) {
      e.target.value = this.selectedElement.getAttribute(attr)
      alert(this.editor.i18next.t('notification.invalidAttrValGiven'))
      return false
    }

    if (attr !== 'id' && attr !== 'class') {
      if (isNaN(val)) {
        val = this.editor.svgCanvas.convertToNum(attr, val)
      } else if (this.editor.configObj.curConfig.baseUnit !== 'px') {
        // Convert unitless value to one with given unit

        const unitData = getTypeMap()

        if (
          this.editor.selectedElement[attr] ||
          this.editor.svgCanvas.getMode() === 'pathedit' ||
          attr === 'x' ||
          attr === 'y'
        ) {
          val *= unitData[this.editor.configObj.curConfig.baseUnit]
        }
      }
    }

    this.editor.svgCanvas.changeSelectedAttribute(attr, val)
    return true
  }

  /**
   *
   * @returns {void}
   */
  convertToPath () {
    if (this.editor.selectedElement) {
      this.editor.svgCanvas.convertToPath()
    }
  }

  /**
   *
   * @returns {void}
   */
  reorientPath () {
    if (this.editor.selectedElement) {
      this.path.reorient()
    }
  }

  /**
   *
   * @returns {void} Resolves to `undefined`
   */
  makeHyperlink () {
    if (this.editor.selectedElement || this.multiselected) {
      const url = prompt(
        this.editor.i18next.t('notification.enterNewLinkURL'),
        'http://'
      )
      if (url) {
        this.editor.svgCanvas.makeHyperlink(url)
      }
    }
  }

  /**
   *
   * @returns {void}
   */
  linkControlPoints () {
    $id('tool_node_link').pressed = !$id('tool_node_link').pressed
    const linked = !!$id('tool_node_link').pressed
    this.path.linkControlPoints(linked)
  }

  /**
   *
   * @returns {void}
   */
  clonePathNode () {
    if (this.path.getNodePoint()) {
      this.path.clonePathNode()
    }
  }

  /**
   *
   * @returns {void}
   */
  deletePathNode () {
    if (this.path.getNodePoint()) {
      this.path.deletePathNode()
    }
  }

  /**
   *
   * @returns {void}
   */
  addSubPath () {
    const button = $id('tool_add_subpath')
    const sp = !button.classList.contains('pressed')
    button.pressed = sp
    // button.toggleClass('push_button_pressed tool_button');
    this.path.addSubPath(sp)
  }

  /**
   *
   * @returns {void}
   */
  opencloseSubPath () {
    this.path.opencloseSubPath()
  }

  /**
   * Delete is a contextual tool that only appears in the ribbon if
   * an element has been selected.
   * @returns {void}
   */
  deleteSelected () {
    if (this.editor.selectedElement || this.editor.multiselected) {
      this.editor.svgCanvas.deleteSelectedElements()
    }
  }

  /**
   *
   * @returns {void}
   */
  moveToTopSelected () {
    if (this.editor.selectedElement) {
      this.editor.svgCanvas.moveToTopSelectedElement()
    }
  }

  /**
   *
   * @returns {void}
   */
  moveToBottomSelected () {
    if (this.editor.selectedElement) {
      this.editor.svgCanvas.moveToBottomSelectedElement()
    }
  }

  /**
   *
   * @returns {false}
   */
  clickBold () {
    this.editor.svgCanvas.setBold(!this.editor.svgCanvas.getBold())
    this.updateContextPanel()
    return false
  }

  /**
   *
   * @returns {false}
   */
  clickItalic () {
    this.editor.svgCanvas.setItalic(!this.editor.svgCanvas.getItalic())
    this.updateContextPanel()
    return false
  }

  /**
   * Handles the click on the text decoration buttons
   *
   * @param value The text decoration value
   * @returns {boolean} false
   */
  clickTextDecoration (value) {
    if (this.editor.svgCanvas.hasTextDecoration(value)) {
      this.editor.svgCanvas.removeTextDecoration(value)
    } else {
      this.editor.svgCanvas.addTextDecoration(value)
    }
    this.updateContextPanel()
    return false
  }

  /**
   * Sets the text anchor value
   *
   * @returns {false}
   */
  clickTextAnchor (evt) {
    this.editor.svgCanvas.setTextAnchor(evt.detail.value)
    return false
  }

  /**
   * @type {module}
   */
  changeLetterSpacing (e) {
    this.editor.svgCanvas.setLetterSpacing(e.target.value)
  }

  /**
   * @type {module}
   */
  changeWordSpacing (e) {
    this.editor.svgCanvas.setWordSpacing(e.target.value)
  }

  /**
   * @type {module}
   */
  changeTextLength (e) {
    this.editor.svgCanvas.setTextLength(e.target.value)
  }

  /**
   * @type {module}
   */
  changeLengthAdjust (evt) {
    this.editor.svgCanvas.setLengthAdjust(evt.detail.value)
  }

  /**
   * Set a selected image's URL.
   * @function module:SVGthis.setImageURL
   * @param {string} url
   * @returns {void}
   */
  setImageURL (url) {
    const { editor } = this
    if (!url) {
      url = editor.defaultImageURL
    }
    editor.svgCanvas.setImageURL(url)
    $id('image_url').value = url

    if (url.startsWith('data:')) {
      // data URI found
      this.hideTool('image_url')
    } else {
      // regular URL
      const promised = editor.svgCanvas.embedImage(url)
      // eslint-disable-next-line promise/catch-or-return
      promised
        // eslint-disable-next-line promise/always-return
        .then(
          () => {
            // switch into "select" mode if we've clicked on an element
            editor.svgCanvas.setMode('select')
            editor.svgCanvas.selectOnly(
              editor.svgCanvas.getSelectedElements(),
              true
            )
          },
          error => {
            console.error('error =', error)
            seAlert(editor.i18next.t('tools.no_embed'))
            editor.svgCanvas.deleteSelectedElements()
          }
        )
      this.displayTool('image_url')
    }
  }

  /**
   *
   */
  updateTitle (title) {
    if (title) this.editor.title = title
    const titleElement = $qa('#title_panel > p')[0]
    if (titleElement) titleElement.textContent = this.editor.title
  }

  /**
   * @param {boolean} editmode
   * @param {module:svgcanvas.SvgCanvas#event:selected} elems
   * @returns {void}
   */
  togglePathEditMode (editMode, elems) {
    if (editMode) {
      this.displayTool('path_node_panel')
    } else {
      this.hideTool('path_node_panel')
    }
    if (editMode) {
      // Change select icon
      $id('tool_path').pressed = false
      $id('tool_select').pressed = true
      $id('tool_select').setAttribute('src', 'select_node.svg')
      this.editor.multiselected = false
      if (elems.length) {
        this.editor.selectedElement = elems[0]
      }
    } else {
      setTimeout(() => {
        $id('tool_select').setAttribute('src', 'select.svg')
      }, 1000)
    }
  }

  /**
   * @type {module}
   */
  init () {
    // add Top panel
    const template = document.createElement('template')
    const { i18next } = this.editor
    template.innerHTML = topPanelHTML
    this.editor.$svgEditor.append(template.content.cloneNode(true))
    // svg editor source dialoag added to DOM
    const newSeEditorDialog = document.createElement(
      'se-svg-source-editor-dialog'
    )
    newSeEditorDialog.setAttribute('id', 'se-svg-editor-dialog')
    this.editor.$container.append(newSeEditorDialog)
    this.updateTitle()
    newSeEditorDialog.init(i18next)
    $id('tool_link_url').setAttribute('title', i18next.t('tools.set_link_url'))
    // register action to top panel buttons
    $click($id('tool_source'), this.showSourceEditor.bind(this))
    $click($id('tool_wireframe'), this.clickWireframe.bind(this))
    $click($id('tool_undo'), this.clickUndo.bind(this))
    $click($id('tool_redo'), this.clickRedo.bind(this))
    $click($id('tool_clone'), this.clickClone.bind(this))
    $click($id('tool_clone_multi'), this.clickClone.bind(this))
    $click($id('tool_delete'), this.deleteSelected.bind(this))
    $click($id('tool_delete_multi'), this.deleteSelected.bind(this))
    $click($id('tool_move_top'), this.moveToTopSelected.bind(this))
    $click($id('tool_move_bottom'), this.moveToBottomSelected.bind(this))
    $click($id('tool_topath'), this.convertToPath.bind(this))
    $click($id('tool_make_link'), this.makeHyperlink.bind(this))
    $click($id('tool_make_link_multi'), this.makeHyperlink.bind(this))
    $click($id('tool_reorient'), this.reorientPath.bind(this))
    $click($id('tool_group_elements'), this.clickGroup.bind(this))
    $id('tool_position').addEventListener('change', (evt) => this.clickAlignEle.bind(this)(evt))
    $click($id('tool_align_left'), () => this.clickAlign.bind(this)('left'))
    $click($id('tool_align_right'), () => this.clickAlign.bind(this)('right'))
    $click($id('tool_align_center'), () => this.clickAlign.bind(this)('center'))
    $click($id('tool_align_top'), () => this.clickAlign.bind(this)('top'))
    $click($id('tool_align_bottom'), () => this.clickAlign.bind(this)('bottom'))
    $click($id('tool_align_middle'), () => this.clickAlign.bind(this)('middle'))
    $click($id('tool_align_distrib_horiz'), () => this.clickAlign.bind(this)('distrib_horiz'))
    $click($id('tool_align_distrib_verti'), () => this.clickAlign.bind(this)('distrib_verti'))
    $click($id('tool_node_clone'), this.clonePathNode.bind(this))
    $click($id('tool_node_delete'), this.deletePathNode.bind(this))
    $click($id('tool_openclose_path'), this.opencloseSubPath.bind(this))
    $click($id('tool_add_subpath'), this.addSubPath.bind(this))
    $click($id('tool_node_link'), this.linkControlPoints.bind(this))
    $id('angle').addEventListener('change', this.changeRotationAngle.bind(this))
    $id('blur').addEventListener('change', this.changeBlur.bind(this))
    $id('rect_rx').addEventListener('change', this.changeRectRadius.bind(this))
    $id('font_size').addEventListener('change', this.changeFontSize.bind(this))
    $click($id('tool_ungroup'), this.clickGroup.bind(this))
    $click($id('tool_bold'), this.clickBold.bind(this))
    $click($id('tool_italic'), this.clickItalic.bind(this))
    $click($id('tool_text_decoration_underline'), () => this.clickTextDecoration.bind(this)('underline'))
    $click($id('tool_text_decoration_linethrough'), () => this.clickTextDecoration.bind(this)('line-through'))
    $click($id('tool_text_decoration_overline'), () => this.clickTextDecoration.bind(this)('overline'))
    $id('tool_text_anchor').addEventListener('change', (evt) => this.clickTextAnchor.bind(this)(evt))
    $id('tool_letter_spacing').addEventListener('change', this.changeLetterSpacing.bind(this))
    $id('tool_word_spacing').addEventListener('change', this.changeWordSpacing.bind(this))
    $id('tool_text_length').addEventListener('change', this.changeTextLength.bind(this))
    $id('tool_length_adjust').addEventListener('change', (evt) => this.changeLengthAdjust.bind(this)(evt))
    $click($id('tool_unlink_use'), this.clickGroup.bind(this))
    $id('image_url').addEventListener('change', (evt) => { this.setImageURL(evt.currentTarget.value) });

    // all top panel attributes
    [
      'elem_id',
      'elem_class',
      'circle_cx',
      'circle_cy',
      'circle_r',
      'ellipse_cx',
      'ellipse_cy',
      'ellipse_rx',
      'ellipse_ry',
      'selected_x',
      'selected_y',
      'rect_width',
      'rect_height',
      'line_x1',
      'line_x2',
      'line_y1',
      'line_y2',
      'image_width',
      'image_height',
      'path_node_x',
      'path_node_y'
    ].forEach(attrId =>
      $id(attrId).addEventListener('change', this.attrChanger.bind(this))
    )
  }
}

export default TopPanel
