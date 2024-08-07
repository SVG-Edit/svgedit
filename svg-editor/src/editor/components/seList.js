/* globals svgEditor */
import { t } from '../locale.js'

const template = document.createElement('template')
template.innerHTML = `
<style>
#select-container {
  margin-top: 10px;
  display: inline-block;
}

#select-container:hover {
  background-color: var(--icon-bg-color-hover);
}

#select-container::part(value) {
  background-color: var(--main-bg-color);
}

#select-container::part(popup-toggle) {
  display: none;
}
::slotted(*) {
  padding:0;
  width:100%;
}

.closed {
  display: none;
}

#options-container {
  position: fixed;
}

</style>
  <label>Label</label>
  <div id="select-container" tabindex="0">
    <div id="selected-value"></div>
    <div id="options-container">
      <slot></slot>
    </div>
  </div>

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
    this.$dropdown = this._shadowRoot.querySelector('#select-container')
    this.$label = this._shadowRoot.querySelector('label')
    this.$selection = this.$dropdown.querySelector('#selected-value')
    this.items = this.querySelectorAll('se-list-item')
    this.imgPath = svgEditor.configObj.curConfig.imgPath
    this.$optionsContainer = this._shadowRoot.querySelector('#options-container')
    this.$optionsContainer.classList.add('closed')
    this.$selection.addEventListener('click', this.toggleList)
    this.updateSelectedValue(this.items[0].getAttribute('value'))
    this.isDropdownOpen = false
  }

  toggleList = (e) => {
    if (!this.isDropdownOpen) {
      this.openDropdown()
      this.setDropdownListPosition()
    } else {
      this.closeDropdown()
    }
  }

  updateSelectedValue = (newValue) => {
    Array.from(this.items).forEach((element) => {
      if (element.getAttribute('value') === newValue) {
        element.setAttribute('selected', true)
        if (element.hasAttribute('src')) {
        // empty current selection children
          while (this.$selection.firstChild) { this.$selection.removeChild(this.$selection.firstChild) }
          // replace selection child with image of new value
          const img = document.createElement('img')
          img.src = this.imgPath + '/' + element.getAttribute('src')
          img.style.height = element.getAttribute('img-height')
          img.setAttribute('title', t(element.getAttribute('title')))
          this.$selection.append(img)
        } else {
          this.$selection.textContent = t(element.getAttribute('option'))
        }
      } else {
        element.setAttribute('selected', false)
      }
    })
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
        this.updateSelectedValue(newValue)
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

  openDropdown = () => {
    this.isDropdownOpen = true
    this.$optionsContainer.classList.remove('closed')
  }

  closeDropdown = () => {
    this.isDropdownOpen = false
    this.$optionsContainer.classList.add('closed')
  }

  setDropdownListPosition = () => {
    const windowHeight = window.innerHeight
    const selectedContainerPosition = this.$selection.getBoundingClientRect()
    const optionsContainerPosition = this.$optionsContainer.getBoundingClientRect()
    // list is bottom of frame - needs to open from above
    if (selectedContainerPosition.bottom + optionsContainerPosition.height > windowHeight) {
      this.$optionsContainer.style.top = selectedContainerPosition.top - optionsContainerPosition.height + 'px'
      this.$optionsContainer.style.left = selectedContainerPosition.left + 'px'
    } else {
      this.$optionsContainer.style.top = selectedContainerPosition.bottom + 'px'
      this.$optionsContainer.style.left = selectedContainerPosition.left + 'px'
    }
  }

  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const currentObj = this
    this.$dropdown.addEventListener('selectedindexchange', (e) => {
      if (e?.detail?.selectedItem !== undefined) {
        const value = e.detail.selectedItem
        const closeEvent = new CustomEvent('change', { detail: { value } })
        currentObj.dispatchEvent(closeEvent)
        currentObj.value = value
        currentObj.setAttribute('value', value)
      }
    })

    this.$dropdown.addEventListener('focusout', (e) => {
      this.closeDropdown()
    })

    window.addEventListener('mousedown', e => {
      // When we click on the canvas and if the dropdown is open, then just close the dropdown and stop the event
      if (this.isDropdownOpen) {
        if (!e.target.closest('se-list')) {
          e.stopPropagation()
          this.closeDropdown()
        }
      }
    }, { capture: true })
  }
}

// Register
customElements.define('se-list', SeList)
