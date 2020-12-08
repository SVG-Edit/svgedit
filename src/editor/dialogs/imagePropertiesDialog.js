/* eslint-disable node/no-unpublished-import */
import 'elix/define/Dialog.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
  :not(:defined) {
    display: none;
  }

  /* Force the scroll bar to appear so we see it hide when overlay opens. */
  body::-webkit-scrollbar {
    background: lightgray;
  }
  body::-webkit-scrollbar-thumb {
    background: darkgray;
  }
  </style>
  <elix-dialog id="svg_docprops" aria-label="Sample dialog" closed>
    <div id="svg_docprops_container">
      <div id="tool_docprops_back" class="toolbar_button">
        <button id="tool_docprops_save">OK</button>
        <button id="tool_docprops_cancel">Cancel</button>
      </div>
      <fieldset id="svg_docprops_docprops">
        <legend id="svginfo_image_props">Image Properties</legend>
        <label>
          <span id="svginfo_title">Title:</span>
          <input type="text" id="canvas_title" />
        </label>
        <fieldset id="change_resolution">
          <legend id="svginfo_dim">Canvas Dimensions</legend>
          <label>
            <span id="svginfo_width">width:</span>
            <input type="text" id="canvas_width" size="6" />
          </label>
          <label>
            <span id="svginfo_height">height:</span>
            <input type="text" id="canvas_height" size="6" />
          </label>
          <label>
            <select id="resolution">
              <option id="selectedPredefined" selected="selected">Select predefined:</option>
              <option>640x480</option>
              <option>800x600</option>
              <option>1024x768</option>
              <option>1280x960</option>
              <option>1600x1200</option>
              <option id="fitToContent" value="content">Fit to Content</option>
            </select>
          </label>
        </fieldset>
        <fieldset id="image_save_opts">
          <legend id="includedImages">Included Images</legend>
          <label>
            <input type="radio" name="image_opt" value="embed" checked="checked" />
            <span id="image_opt_embed">Embed data (local files)</span>
          </label>
          <label>
            <input type="radio" name="image_opt" value="ref" />
            <span id="image_opt_ref">Use file reference</span>
          </label>
        </fieldset>
      </fieldset>
    </div>
  </elix-dialog>
  
`;
/**
 * @class SeImgPropDialog
 */
export class SeImgPropDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super();
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this._shadowRoot.appendChild(template.content.cloneNode(true));
    this.$cancel = this._shadowRoot.querySelector('#tool_docprops_cancel');
    this.$resolution = this._shadowRoot.querySelector('#resolution');
    this.$canvasWidth = this._shadowRoot.querySelector('#canvas_width');
    this.$canvasHeight = this._shadowRoot.querySelector('#canvas_height');
  }
  /**
   * @function connectedCallback
   * @returns {void}
   */
  connectedCallback () {
    const onChangeHandler = (ev) => {
      if (!ev.target.selectedIndex) {
        if (this.$canvasWidth.getAttribute('value') === 'fit') {
          this.$canvasWidth.removeAttribute('disabled');
          this.$canvasWidth.value = 100;
          this.$canvasHeight.removeAttribute('disabled');
          this.$canvasHeight.value = 100;
        }
      } else if (ev.target.value === 'content') {
        this.$canvasWidth.setAttribute('disabled', 'disabled');
        this.$canvasWidth.value = 'fit';
        this.$canvasHeight.setAttribute('disabled', 'disabled');
        this.$canvasHeight.value = 'fit';
      } else {
        const dims = ev.target.value.split('x');
        this.$canvasWidth.value = dims[0];
        this.$canvasWidth.removeAttribute('disabled');
        this.$canvasHeight.value = dims[1];
        this.$canvasHeight.removeAttribute('disabled');
      }
    };
    this.$resolution.addEventListener('change', onChangeHandler);
  }
}

// Register
customElements.define('se-img-prop-dialog', SeImgPropDialog);
