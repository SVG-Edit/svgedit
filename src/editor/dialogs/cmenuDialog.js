/* globals svgEditor */
import cMenuDialogHTML from './cmenuDialog.html'
const template = document.createElement('template')
template.innerHTML = cMenuDialogHTML
/**
 * @class SeCMenuDialog
 */
export class SeCMenuDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this._workarea = document.getElementById('workarea')
    this.$dialog = this._shadowRoot.querySelector('#cmenu_canvas')
    this.$copyLink = this._shadowRoot.querySelector('#se-copy')
    this.$cutLink = this._shadowRoot.querySelector('#se-cut')
    this.$pasteLink = this._shadowRoot.querySelector('#se-paste')
    this.$pasteInPlaceLink = this._shadowRoot.querySelector('#se-paste-in-place')
    this.$deleteLink = this._shadowRoot.querySelector('#se-delete')
    this.$groupLink = this._shadowRoot.querySelector('#se-group')
    this.$ungroupLink = this._shadowRoot.querySelector('#se-ungroup')
    this.$moveFrontLink = this._shadowRoot.querySelector('#se-move-front')
    this.$moveUpLink = this._shadowRoot.querySelector('#se-move-up')
    this.$moveDownLink = this._shadowRoot.querySelector('#se-move-down')
    this.$moveBackLink = this._shadowRoot.querySelector('#se-move-back')
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('tools-cut', i18next.t('tools.cut'))
    this.setAttribute('tools-copy', i18next.t('tools.copy'))
    this.setAttribute('tools-paste', i18next.t('tools.paste'))
    this.setAttribute('tools-paste_in_place', i18next.t('tools.paste_in_place'))
    this.setAttribute('tools-delete', i18next.t('tools.delete'))
    this.setAttribute('tools-group', i18next.t('tools.group'))
    this.setAttribute('tools-ungroup', i18next.t('tools.ungroup'))
    this.setAttribute('tools-move_front', i18next.t('tools.move_front'))
    this.setAttribute('tools-move_up', i18next.t('tools.move_up'))
    this.setAttribute('tools-move_down', i18next.t('tools.move_down'))
    this.setAttribute('tools-move_back', i18next.t('tools.move_back'))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['disableallmenu', 'enablemenuitems', 'disablemenuitems', 'tools-cut',
      'tools-copy', 'tools-paste', 'tools-paste_in_place', 'tools-delete', 'tools-group',
      'tools-ungroup', 'tools-move_front', 'tools-move_up', 'tools-move_down',
      'tools-move_back']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let eles = []
    let textnode
    const sdowRoot = this._shadowRoot
    switch (name) {
      case 'disableallmenu':
        if (newValue === 'true') {
          const elesli = sdowRoot.querySelectorAll('li')
          elesli.forEach(function (eleli) {
            eleli.classList.add('disabled')
          })
        }
        break
      case 'enablemenuitems':
        eles = newValue.split(',')
        eles.forEach(function (ele) {
          const selEle = sdowRoot.querySelector('a[href*="' + ele + '"]')
          selEle.parentElement.classList.remove('disabled')
        })
        break
      case 'disablemenuitems':
        eles = newValue.split(',')
        eles.forEach(function (ele) {
          const selEle = sdowRoot.querySelector('a[href*="' + ele + '"]')
          selEle.parentElement.classList.add('disabled')
        })
        break
      case 'tools-cut':
        textnode = document.createTextNode(newValue)
        this.$cutLink.prepend(textnode)
        break
      case 'tools-copy':
        textnode = document.createTextNode(newValue)
        this.$copyLink.prepend(textnode)
        break
      case 'tools-paste':
        this.$pasteLink.textContent = newValue
        break
      case 'tools-paste_in_place':
        this.$pasteInPlaceLink.textContent = newValue
        break
      case 'tools-delete':
        textnode = document.createTextNode(newValue)
        this.$deleteLink.prepend(textnode)
        break
      case 'tools-group':
        textnode = document.createTextNode(newValue)
        this.$groupLink.prepend(textnode)
        break
      case 'tools-ungroup':
        textnode = document.createTextNode(newValue)
        this.$ungroupLink.prepend(textnode)
        break
      case 'tools-move_front':
        textnode = document.createTextNode(newValue)
        this.$moveFrontLink.prepend(textnode)
        break
      case 'tools-move_up':
        textnode = document.createTextNode(newValue)
        this.$moveUpLink.prepend(textnode)
        break
      case 'tools-move_down':
        textnode = document.createTextNode(newValue)
        this.$moveDownLink.prepend(textnode)
        break
      case 'tools-move_back':
        textnode = document.createTextNode(newValue)
        this.$moveBackLink.prepend(textnode)
        break
      default:
      // super.attributeChangedCallback(name, oldValue, newValue);
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get disableallmenu () {
    return this.getAttribute('disableallmenu')
  }

  /**
   * @function set
   * @returns {void}
   */
  set disableallmenu (value) {
    this.setAttribute('disableallmenu', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get enablemenuitems () {
    return this.getAttribute('enablemenuitems')
  }

  /**
   * @function set
   * @returns {void}
   */
  set enablemenuitems (value) {
    this.setAttribute('enablemenuitems', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get disablemenuitems () {
    return this.getAttribute('disablemenuitems')
  }

  /**
   * @function set
   * @returns {void}
   */
  set disablemenuitems (value) {
    this.setAttribute('disablemenuitems', value)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const current = this
    const onMenuOpenHandler = (e) => {
      e.preventDefault()
      // Detect mouse position
      let x = e.pageX
      let y = e.pageY

      const xOff = screen.width - 250 // menu width
      const yOff = screen.height - (276 + 150) // menu height + bottom panel height and scroll bar

      if (x > xOff) {
        x = xOff
      }
      if (y > yOff) {
        y = yOff
      }
      current.$dialog.style.top = y + 'px'
      current.$dialog.style.left = x + 'px'
      current.$dialog.style.display = 'block'
    }
    const onMenuCloseHandler = (e) => {
      if (e.button !== 2) {
        current.$dialog.style.display = 'none'
      }
    }
    const onMenuClickHandler = (e, action) => {
      const triggerEvent = new CustomEvent('change', {
        detail: {
          trigger: action
        }
      })
      this.dispatchEvent(triggerEvent)
    }
    this._workarea.addEventListener('contextmenu', onMenuOpenHandler)
    this._workarea.addEventListener('mousedown', onMenuCloseHandler)
    svgEditor.$click(this.$cutLink, (evt) => onMenuClickHandler(evt, 'cut'))
    svgEditor.$click(this.$copyLink, (evt) => onMenuClickHandler(evt, 'copy'))
    svgEditor.$click(this.$pasteLink, (evt) => onMenuClickHandler(evt, 'paste'))
    svgEditor.$click(this.$pasteInPlaceLink, (evt) => onMenuClickHandler(evt, 'paste_in_place'))
    svgEditor.$click(this.$deleteLink, (evt) => onMenuClickHandler(evt, 'delete'))
    svgEditor.$click(this.$groupLink, (evt) => onMenuClickHandler(evt, 'group'))
    svgEditor.$click(this.$ungroupLink, (evt) => onMenuClickHandler(evt, 'ungroup'))
    svgEditor.$click(this.$moveFrontLink, (evt) => onMenuClickHandler(evt, 'move_front'))
    svgEditor.$click(this.$moveUpLink, (evt) => onMenuClickHandler(evt, 'move_up'))
    svgEditor.$click(this.$moveDownLink, (evt) => onMenuClickHandler(evt, 'move_down'))
    svgEditor.$click(this.$moveBackLink, (evt) => onMenuClickHandler(evt, 'move_back'))
  }
}

// Register
customElements.define('se-cmenu_canvas-dialog', SeCMenuDialog)
