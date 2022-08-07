/* globals svgEditor */
const template = document.createElement('template')
template.innerHTML = `
  <style>
  input{
    border:unset;
    background-color:var(--input-color);
    min-width:unset;
    width:40px;
    height:23px;
    padding:1px 2px;
    border:2px;
    font: inherit;
    margin: 2px 1px 0px 2px;
    box-sizing:border-box;
    text-align: center;
    border-radius: 3px 0px 0px 3px;
  }
  #tool-wrapper{
    height:20px;
    display:flex;
    align-items:center;
  }
  #icon{
    margin-bottom:1px
  }
  #spinner{
    display:flex;
    flex-direction:column;
  }
  #spinner > div {
    height: 11px;
    width: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 7px;
    border-left:solid 1px transparent;
    border-right:solid 1px transparent;
    background-color:var(--input-color);
  }
  #arrow-up{
    height:9px;
    margin-top: 2px;
    margin-bottom: 1px;
  }
  #down{
    width:18px;
    height:23px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color:var(--input-color);
    border-radius: 0px 3px 3px 0px;
    margin: 2px 5px 0px 1px;
  }
  #down > img {
    margin-top: 2px;
  }
  #options-container {
    position:fixed
    display:flex;
    flex-direction:column;
    background-color:var(--icon-bg-color);
    border:solid 1px white;
    box-shadow:0 0px 10px rgb(0 0 0 / 50%);
  }
  ::slotted(*) {
    margin:2px;
    padding:3px;
    color:white;
  }
  ::slotted(*:hover) {
    background-color: rgb(43, 60, 69);
  }
  </style>
  <div id="tool-wrapper">
    <img id="icon" alt="icon" width="18" height="18"/>
    <input/>
    <div id="spinner">
      <div id="arrow-up">▲</div>
      <div id="arrow-down">▼</div>
    </div>
    <div id="down">
      <img width="16" height="8" src="./images/arrow_down.svg"/>
    </div>
  </div>
  <div id="options-container" style="display:none">
    <slot></slot>
  </div>
`

class SeZoom extends HTMLElement {
  constructor () {
    super()

    this.handleMouseDown = this.handleMouseDown.bind(this)
    this.handleMouseUp = this.handleMouseUp.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.initPopup = this.initPopup.bind(this)
    this.handleInput = this.handleInput.bind(this)

    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    // locate the component
    this._shadowRoot.append(template.content.cloneNode(true))

    // prepare the slot element
    this.slotElement = this._shadowRoot.querySelector('slot')
    this.slotElement.addEventListener(
      'slotchange',
      this.handleOptionsChange.bind(this)
    )

    // hookup events for the input box
    this.inputElement = this._shadowRoot.querySelector('input')
    this.inputElement.addEventListener('click', this.handleClick.bind(this))
    this.inputElement.addEventListener('change', this.handleInput)
    this.inputElement.addEventListener('keydown', this.handleKeyDown)

    this.clickArea = this._shadowRoot.querySelector('#down')
    this.clickArea.addEventListener('click', this.handleClick.bind(this))

    // set src for imageElement
    this.imageElement = this._shadowRoot.querySelector('img')
    this.imageElement.setAttribute(
      'src',
      (this.imgPath =
        svgEditor.configObj.curConfig.imgPath + '/' + this.getAttribute('src'))
    )

    // hookup events for arrow buttons
    this.arrowUp = this._shadowRoot.querySelector('#arrow-up')
    this.arrowUp.addEventListener('click', this.increment.bind(this))
    this.arrowUp.addEventListener('mousedown', e =>
      this.handleMouseDown('up', true)
    )
    this.arrowUp.addEventListener('mouseleave', e => this.handleMouseUp('up'))
    this.arrowUp.addEventListener('mouseup', e => this.handleMouseUp('up'))

    this.arrowDown = this._shadowRoot.querySelector('#arrow-down')
    this.arrowDown.addEventListener('click', this.decrement.bind(this))
    this.arrowDown.addEventListener('mousedown', e =>
      this.handleMouseDown('down', true)
    )
    this.arrowDown.addEventListener('mouseleave', e =>
      this.handleMouseUp('down')
    )
    this.arrowDown.addEventListener('mouseup', e => this.handleMouseUp('down'))

    this.optionsContainer = this._shadowRoot.querySelector(
      '#options-container'
    )

    // add an event listener to close the popup
    document.addEventListener('click', e => this.handleClose(e))
    this.changedTimeout = null
  }

  static get observedAttributes () {
    return ['value']
  }

  /**
   * @function get
   * @returns {any}
   */
  get value () {
    return this.getAttribute('value')
  }

  /**
   * @function set
   * @returns {void}
   */
  set value (value) {
    this.setAttribute('value', value)
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === newValue) {
      switch (name) {
        case 'value':
          if (parseInt(this.inputElement.value) !== newValue) {
            this.inputElement.value = newValue
          }
          break
      }

      return
    }

    switch (name) {
      case 'value':
        this.inputElement.value = newValue
        this.dispatchEvent(
          new CustomEvent('change', { detail: { value: newValue } })
        )
        break
    }
  }

  /**
   * @function handleOptionsChange
   * @returns {void}
   */
  handleOptionsChange () {
    if (this.slotElement.assignedElements().length > 0) {
      this.options = this.slotElement.assignedElements()
      this.selectedValue = this.options[0].textContent

      this.initPopup()

      this.options.forEach(option => {
        option.addEventListener('click', e => this.handleSelect(e))
      })
    }
  }

  /**
   * @function handleClick
   * @returns {void}
   */
  handleClick () {
    this.optionsContainer.style.display = 'flex'
    this.inputElement.select()
    this.initPopup()
  }

  /**
   * @function handleSelect
   * @param {Event} e
   * @returns {void}
   */
  handleSelect (e) {
    this.value = e.target.getAttribute('value')
    this.title = e.target.getAttribute('text')
  }

  /**
   * @function handleShow
   * @returns {void}
   * initialises the popup menu position
   */
  initPopup () {
    const zoomPos = this.getBoundingClientRect()
    const popupPos = this.optionsContainer.getBoundingClientRect()
    const top = zoomPos.top - popupPos.height
    const left = zoomPos.left

    this.optionsContainer.style.position = 'fixed'
    this.optionsContainer.style.top = `${top}px`
    this.optionsContainer.style.left = `${left}px`
  }

  /**
   * @function handleClose
   * @param {Event} e
   * @returns {void}
   * Close the popup menu
   */
  handleClose (e) {
    if (e.target !== this) {
      this.optionsContainer.style.display = 'none'
      this.inputElement.blur()
    }
  }

  /**
   * @function handleInput
   * @returns {void}
   */
  handleInput () {
    if (this.changedTimeout) {
      clearTimeout(this.changedTimeout)
    }

    this.changedTimeout = setTimeout(this.triggerInputChanged.bind(this), 500)
  }

  /**
   * @function triggerInputChanged
   * @returns {void}
   */
  triggerInputChanged () {
    const newValue = this.inputElement.value
    this.value = newValue
  }

  /**
   * @function increment
   * @returns {void}
   */
  increment () {
    this.value = parseInt(this.value) + 10
  }

  /**
   * @function decrement
   * @returns {void}
   */
  decrement () {
    if (this.value - 10 <= 0) {
      this.value = 10
    } else {
      this.value = parseInt(this.value) - 10
    }
  }

  /**
   * @function handleMouseDown
   * @param {string} dir
   * @param {boolean} isFirst
   * @returns {void}
   * Increment/Decrement on mouse held down, if its the first call add a delay before starting
   */
  handleMouseDown (dir, isFirst) {
    if (dir === 'up') {
      this.incrementHold = true
      !isFirst && this.increment()

      setTimeout(
        () => {
          if (this.incrementHold) {
            this.handleMouseDown(dir, false)
          }
        },
        isFirst ? 500 : 50
      )
    } else if (dir === 'down') {
      this.decrementHold = true
      !isFirst && this.decrement()

      setTimeout(
        () => {
          if (this.decrementHold) {
            this.handleMouseDown(dir, false)
          }
        },
        isFirst ? 500 : 50
      )
    }
  }

  /**
   * @function handleMouseUp
   * @param {string} dir
   * @returns {void}
   */
  handleMouseUp (dir) {
    if (dir === 'up') {
      this.incrementHold = false
    } else {
      this.decrementHold = false
    }
  }

  /**
   * @function handleKeyDown
   * @param {Event} e
   * @returns {void}
   */
  handleKeyDown (e) {
    if (e.key === 'ArrowUp') {
      this.increment()
    } else if (e.key === 'ArrowDown') {
      this.decrement()
    }
  }
}

// Register
customElements.define('se-zoom', SeZoom)
