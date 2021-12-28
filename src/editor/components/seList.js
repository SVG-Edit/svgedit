/* globals svgEditor */
import 'elix/define/DropdownList.js'
import { t } from '../locale.js'

const template = document.createElement('template')
template.innerHTML = `
<style>
elix-dropdown-list {
  margin-top: 10px;
}

elix-dropdown-list:hover {
  background-color: var(--icon-bg-color-hover);
}

elix-dropdown-list::part(value) {
  background-color: var(--main-bg-color);
}

elix-dropdown-list::part(popup-toggle) {
  display: none;
}
::slotted(*) {
  padding:0;
  width:100%;
}
</style>
  <label>Label</label>
  <elix-dropdown-list>
    <slot></slot>
  </elix-dropdown-list>

`
/**
 * @class SeList
 */
export class SeList extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dropdown = this._shadowRoot.querySelector('elix-dropdown-list')
    this.$label = this._shadowRoot.querySelector('label')
    this.$selection = this.$dropdown.shadowRoot.querySelector('#value')
    this.items = this.querySelectorAll('se-list-item')
    this.imgPath = svgEditor.configObj.curConfig.imgPath
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['label', 'width', 'height', 'title', 'value']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    const currentObj = this
    if (oldValue === newValue) return
    switch (name) {
      case 'title':
        this.$dropdown.setAttribute('title', t(newValue))
        break
      case 'label':
        this.$label.textContent = t(newValue)
        break
      case 'height':
        this.$dropdown.style.height = newValue
        break
      case 'width':
        this.$dropdown.style.width = newValue
        break
      case 'value':
        Array.from(this.items).forEach(function (element) {
          if (element.getAttribute('value') === newValue) {
            if (element.hasAttribute('src')) {
            // empty current selection children
              while (currentObj.$selection.firstChild) { currentObj.$selection.removeChild(currentObj.$selection.firstChild) }
              // replace selection child with image of new value
              const img = document.createElement('img')
              img.src = currentObj.imgPath + '/' + element.getAttribute('src')
              img.style.height = element.getAttribute('img-height')
              img.setAttribute('title', t(element.getAttribute('title')))
              currentObj.$selection.append(img)
            } else {
              currentObj.$selection.textContent = t(element.getAttribute('option'))
            }
          }
        })
        break
      default:
        console.error(`unknown attribute: ${name}`)
        break
    }
  }

  /**
   * @function get
   * @returns {any}
   */
  get title () {
    return this.getAttribute('title')
  }

  /**
   * @function set
   * @returns {void}
   */
  set title (value) {
    this.setAttribute('title', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get label () {
    return this.getAttribute('label')
  }

  /**
   * @function set
   * @returns {void}
   */
  set label (value) {
    this.setAttribute('label', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get width () {
    return this.getAttribute('width')
  }

  /**
   * @function set
   * @returns {void}
   */
  set width (value) {
    this.setAttribute('width', value)
  }

  /**
   * @function get
   * @returns {any}
   */
  get height () {
    return this.getAttribute('height')
  }

  /**
   * @function set
   * @returns {void}
   */
  set height (value) {
    this.setAttribute('height', value)
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const currentObj = this
    this.$dropdown.addEventListener('selectedindexchange', (e) => {
      if (e?.detail?.selectedIndex !== undefined) {
        const value = this.$dropdown.selectedItem.getAttribute('value')
        const closeEvent = new CustomEvent('change', { detail: { value } })
        currentObj.dispatchEvent(closeEvent)
        currentObj.value = value
        currentObj.setAttribute('value', value)
      }
    })
    this.$dropdown.addEventListener('close', (_e) => {
      /** with Chrome, selectedindexchange does not fire consistently
      * unless you forec change in this close event
      */
      this.$dropdown.selectedIndex = this.$dropdown.currentIndex
    })
  }
}

// Register
customElements.define('se-list', SeList)
