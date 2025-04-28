/**
 * @file ext-tactile-render.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'tactilerender'
import tactileRenderHTML from './tactileRenderDialog.html'
import { fileOpen, fileSave } from 'browser-fs-access'

const template = document.createElement('template')
template.innerHTML = tactileRenderHTML
var layerSelected = "None"
var graphicTitle = ""
var graphicId = ""
var secretKey = ""
var graphic = ""
var coords = ""
var placeId = ""

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('../ext-tactile-render/locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

const encryptData = async function (svgEditor, svgString) {
  const password = svgEditor.password

    // Convert text and password to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(svgString);
    const passwordBuffer = encoder.encode(password);

    const Uint8ToString = function (u8a){
      var CHUNK_SZ = 0x8000;
      var c = [];
      for (var i=0; i < u8a.length; i+=CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i+CHUNK_SZ)));
      }
      return c.join("");
    }
    // Derive a cryptographic key from the password using PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Use a salt for key derivation
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-CBC", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    // Generate a random IV for encryption
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      aesKey,
      data
    );

    const encrypted = new Uint8Array(encryptedData)
    const concatenatedArray = new Uint8Array(salt.length + iv.length + encrypted.length);
    concatenatedArray.set(salt, 0);
    concatenatedArray.set(iv, salt.length);
    concatenatedArray.set(encrypted, (salt.length+ iv.length))
    svgString = window.btoa(Uint8ToString(concatenatedArray));
    return svgString
}

const updateStorage = async function (channelTitle, channelId, secret) {
  channelTitle = await encryptData(svgEditor, channelTitle);
  channelId = await encryptData(svgEditor, channelId);
  secret = await encryptData(svgEditor, secret);
  const store = {"channelId": channelId, "graphicTitle": channelTitle, 
    "secretKey": secret} 
  if (graphic != ""){
    store.graphicBlob = graphic
  }
  if (placeId != ""){
    store.placeID = placeId
  }
  if (coords != ""){
    store.coordinates = coords
  }
  svgEditor.storage.setItem('tat-storage-data', JSON.stringify(store));
  let messageObj = { "messageFrom": "AuthoringTool", "storageData": JSON.stringify(store) };
  window.postMessage(messageObj, "*");
}

/**
 * @class SeLabelDialog
 */
export class SeTactileRenderDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#id_value_box')
    this.$submitBtn = this._shadowRoot.querySelector('#submit')
    this.$cancelBtn = this._shadowRoot.querySelector('#cancel')
    this.$importBtn = this._shadowRoot.querySelector('#import')
    this.$exportBtn = this._shadowRoot.querySelector('#export')
    this.$titleVal = this._shadowRoot.querySelector('#title_value')
    this.$idVal = this._shadowRoot.querySelector('#id_value')
    this.$secretVal = this._shadowRoot.querySelector('#secret_value')
    this.$lyrSelect = this._shadowRoot.querySelector('#layer_select_dd')
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('label-ok', i18next.t(`${name}:render_id.submit_lbl`))
    this.setAttribute('label-cancel', i18next.t(`common.cancel`))
    this.setAttribute('label-import', i18next.t(`${name}:render_id.import_lbl`))
    this.setAttribute('label-export', i18next.t(`${name}:render_id.export_lbl`))
    this.setAttribute('label-title_val', i18next.t(`${name}:render_id.title_val`))
    this.setAttribute('label-id_val', i18next.t(`${name}:render_id.id_val`))
    this.setAttribute('label-secret_val', i18next.t(`${name}:render_id.secret_val`))
    this.setAttribute('label-layer_val', i18next.t(`${name}:render_id.layer_val`))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'label-ok', 'label-cancel', 'label-import', 'label-export', 'label-title_val', 'label-id_val', 'label-secret_val', 'title_val', 'id_val', 'secret_val', 'label-layer_val', 'layer_val', 'layer_num']
  }

  /**
   * @function attributeChangedCallback
   * @param {string} name
   * @param {string} oldValue
   * @param {string} newValue
   * @returns {void}
   */
  attributeChangedCallback (name, oldValue, newValue) {
    let node
    switch (name) {
      case 'dialog':
        if (newValue === 'open') {
          this._shadowRoot.querySelector('#title_value').value = graphicTitle
          this._shadowRoot.querySelector('#id_value').value = graphicId
          this._shadowRoot.querySelector('#secret_value').value = secretKey
          this.$dialog.open()
        } else {
          graphicTitle = this._shadowRoot.querySelector('#title_value').value
          graphicId = this._shadowRoot.querySelector('#id_value').value
          secretKey = this._shadowRoot.querySelector('#secret_value').value
          layerSelected = this._shadowRoot.querySelector('#layer_select_dd').value
          updateStorage(graphicTitle, graphicId, secretKey);
          this.$dialog.close()
        }
        break
      case 'label-ok':
        this.$submitBtn.textContent = newValue
        break
      case 'label-cancel':
        this.$cancelBtn.textContent = newValue
        break
      case 'label-import':
        this.$importBtn.textContent = newValue
        break
      case 'label-export':
        this.$exportBtn.textContent = newValue
        break
      case 'label-title_val':
        node = this._shadowRoot.querySelector('#title_value_prompt')
        node.textContent = newValue
        break
      case 'label-id_val':
        node = this._shadowRoot.querySelector('#id_value_prompt')
        node.textContent = newValue
        break
      case 'label-secret_val':
        node = this._shadowRoot.querySelector('#secret_value_prompt')
        node.textContent = newValue
        break
      case 'title_val':
        node = this._shadowRoot.querySelector('#title_value')
        node.textContent = newValue
        break
      case 'id_val':
        node = this._shadowRoot.querySelector('#id_value')
        node.textContent = newValue
        break 
      case 'secret_val':
        node = this._shadowRoot.querySelector('#secret_value')
        node.textContent = newValue
        break
      case 'label-layer_val':
        node = this._shadowRoot.querySelector('#layer_select_prompt')
        node.textContent = newValue
        break
      case 'layer_val':
        node = this._shadowRoot.querySelector('#layer_select_dd')
        node.textContent = newValue
        break 
      default:
      // super.attributeChangedCallback(name, oldValue, newValue);
        break
    }
  }
/**
   * @function connectedCallback
   * @returns {void}
   */
connectedCallback () {
  const { svgCanvas } = svgEditor
  const { $id, $click } = svgCanvas
  const onSaveHandler = async function (){
    document.getElementById('se-tactile-render-dialog').setAttribute('dialog', 'close')
    let xhr = new XMLHttpRequest();
    let svgString= svgCanvas.getSvgString();
    let parser = new DOMParser();
    let svgDoc = parser.parseFromString(svgString, "text/xml");
    if (svgDoc.querySelector('g[data-image-layer="fullImage"]')){
      let children = svgDoc.querySelector('g[data-image-layer="fullImage"]').childNodes
      while (children.length>0) {
        svgDoc.querySelector('svg').appendChild(children.item(0))
      }
      svgDoc.querySelector('g[data-image-layer="fullImage"]').remove()
    }
    svgString = new XMLSerializer().serializeToString(svgDoc)
    
    /*const password = svgEditor.password

    // Convert text and password to Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(svgString);
    const passwordBuffer = encoder.encode(password);

    // Derive a cryptographic key from the password using PBKDF2
    const salt = crypto.getRandomValues(new Uint8Array(16)); // Use a salt for key derivation
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-CBC", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );

    // Generate a random IV for encryption
    const iv = crypto.getRandomValues(new Uint8Array(16));

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      aesKey,
      data
    );

    // console.warn("Encrypted Data (Uint8Array):", new Uint8Array(encryptedData));
    // console.warn("IV (Uint8Array):", new Uint8Array(iv));

    // Convert encrypted data to Base64 for transmission
    //svgString = btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
    //const ivBase64 = btoa(String.fromCharCode(...iv));
    //const saltBase64 = btoa(String.fromCharCode(...salt));
    
    //console.warn(ivBase64)
    //console.warn(saltBase64)
    const encrypted = new Uint8Array(encryptedData)
    const concatenatedArray = new Uint8Array(salt.length + iv.length + encrypted.length);
    concatenatedArray.set(salt, 0);
    concatenatedArray.set(iv, salt.length);
    concatenatedArray.set(encrypted, (salt.length+ iv.length))
    svgString = window.btoa(Uint8ToString(concatenatedArray));
    */
    svgString = await encryptData(svgEditor, svgString)

    if (graphicId == ""){
      xhr.open("POST", "https://monarch.unicorn.cim.mcgill.ca/create");
    } else {
      xhr.open("POST", "https://monarch.unicorn.cim.mcgill.ca/update/"+graphicId);
    }
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Access-Control-Allow-Origin", '*');
    xhr.setRequestHeader("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS");
    xhr.setRequestHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, ETag")
    xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true')
    xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (graphicId != ""){
        $id('se-prompt-dialog').title = xhr.responseText;
        $id('se-prompt-dialog').setAttribute('close', false)
      }
      else {
        let keys = JSON.parse(xhr.responseText)
        let container = document.getElementById('se-tactile-render-dialog').shadowRoot
        graphicId = keys.id
        secretKey = keys.secret
        $id('se-prompt-dialog').title = "New channel created with code "+graphicId;
        $id('se-prompt-dialog').setAttribute('close', false)
      }
    }};
    var resp = {data: svgString,//"data:image/svg+xml;base64,"+svgString,//+window.btoa(svgString), 
        "layer": layerSelected,
        "title": graphicTitle}
    if (graphic != ""){
      resp.graphicBlob = graphic
    }
    if (placeId != ""){
      resp.placeID = placeId
    }
    if (coords != ""){
      resp.coordinates = coords
    }
    if (graphicId != ""){
      resp.secret = secretKey
    }
    xhr.send(JSON.stringify(resp));
    }

    

    const onImportHandler = async function () {
      try {
        const blob = await fileOpen({
          extensions: ['.json']
        })
        const data = await blob.text()
        let keys = JSON.parse(data)
        let container =document.getElementById('se-tactile-render-dialog').shadowRoot
        container.querySelector("#id_value").value = keys.id
        container.querySelector("#secret_value").value = keys.secret
      } catch (err) {
        if (err.name !== 'AbortError') {
          return console.warn(err)
        }
      }
    }
    
    const onExportHandler = async function () {
      try{
        let container = document.getElementById('se-tactile-render-dialog').shadowRoot
        let blob = new Blob([JSON.stringify({"id":container.querySelector("#id_value").value, 
        "secret": container.querySelector("#secret_value").value
      })], {
          type: 'application/json',
        });
        const saver = await fileSave(blob, {
          fileName: 'Untitled.json',
          extensions: ['.json'],
          type: 'application/json'
        })

      }catch (err) {
        if (err.name !== 'AbortError') {
          return console.warn(err)
        }
      }
      document.getElementById('se-tactile-render-dialog').setAttribute('dialog', 'close')
    }
    const onCancelHandler = () => {
      document.getElementById('se-tactile-render-dialog').setAttribute('dialog', 'close')
    }
  svgEditor.$click(this.$submitBtn, onSaveHandler)
  svgEditor.$click(this.$importBtn, onImportHandler)
  svgEditor.$click(this.$exportBtn, onExportHandler)
  svgEditor.$click(this.$cancelBtn, onCancelHandler)
}
}

// Register
customElements.define('se-tactile-render-dialog', SeTactileRenderDialog)  

export default {
  name,
  async init () {
    const svgEditor = this
    const { svgCanvas, storage } = svgEditor
    const svgroot = svgCanvas.getSvgRoot()
    await loadExtensionTranslation(svgEditor)
    // const { ChangeElementCommand } = svgCanvas.history
    // svgdoc = S.svgroot.parentNode.ownerDocument,
    // const addToHistory = (cmd) => { svgCanvas.undoMgr.addCommandToHistory(cmd) }
    const { $id, $click } = svgCanvas
    

    return {
      name: svgEditor.i18next.t(`${name}:name`),
      async readStorage(){
        let info = JSON.parse(storage.getItem('tat-storage-data'))
        if (info){
          graphicId = info.channelId ? await svgEditor.svgCanvas.runExtensions('decryptData', info.channelId)  : ""
          graphicTitle = info.graphicTitle ? await svgEditor.svgCanvas.runExtensions('decryptData', info.graphicTitle)  : ""
          secretKey = info.secretKey ? await svgEditor.svgCanvas.runExtensions('decryptData', info.secretKey) : ""
          graphic = info.graphicBlob ? info.graphicBlob : ""
          placeId = info.placeID ? info.placeID : ""
          coords = info.coordinates ? info.coordinates : ""
        }
      },
      async encryptDataVal(data){
        svgString = await encryptData(data.editor, data.svgString)
        return svgString
      },
      callback () {
        // Add the button and its handler(s)
        const title = `${name}:buttons.0.title`
        const key = `${name}:buttons.0.key`
        const buttonTemplate = `
        <se-button id="tool_tactile" title="${title}" src="tactile.svg" shortcut=${key}></se-button>
        `
        svgCanvas.insertChildAtIndex($id('tools_left'), buttonTemplate, 12)
        const tactileRndrDialog = document.createElement('se-tactile-render-dialog')
        tactileRndrDialog.setAttribute('id', 'se-tactile-render-dialog')
        document.getElementById('container').append(tactileRndrDialog)
        tactileRndrDialog.init(svgEditor.i18next)

        $click($id('tool_tactile'), () => {
            svgCanvas.setMode('tactile')
            svgCanvas.clearSelection()
            document.getElementById('se-tactile-render-dialog').setAttribute('dialog', 'open')
            // making sure the dropdown is correctly populated
            let container =document.getElementById('se-tactile-render-dialog').shadowRoot
            let select = container.querySelector("#layer_select_dd")
            let drawing= svgCanvas.getCurrentDrawing()
            let layer = drawing.getNumLayers()
            select.replaceChildren()
            var opt = document.createElement('option')
            opt.value = "None";
            opt.innerHTML = "None";
            if (layerSelected == "None")
              opt.selected = "selected"
            select.appendChild(opt);
            for (let i = 0; i < layer; i++) {
              const name = drawing.getLayerName(i)
              var opt = document.createElement('option')
              opt.value = name;
              opt.innerHTML = name;
              if (layerSelected == name)
                opt.selected = "selected"
              select.appendChild(opt);
            }
        })
        window.addEventListener('storage', async (evt)=>{
          if (evt.key == 'tat-storage-data'){
            let info = JSON.parse(evt.newValue)
            graphicId = info.channelId ? await svgEditor.svgCanvas.runExtensions('decryptData', info.channelId)  : ""
            graphicTitle = info.graphicTitle ? await svgEditor.svgCanvas.runExtensions('decryptData', info.graphicTitle)  : ""
            secretKey = info.secretKey ? await svgEditor.svgCanvas.runExtensions('decryptData', info.secretKey): ""
            graphic = info.graphicBlob ? info.graphicBlob : ""
            placeId = info.placeID ? info.placeID : ""
            coords = info.coordinates ? info.coordinates : ""
          }})
      }
    }
  }
}