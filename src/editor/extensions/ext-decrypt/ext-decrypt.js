/**
 * @file ext-decrypt.js
 *
 * @license MIT
 *
 * @copyright 2010 Jeff Schiller
 * @copyright 2021 OptimistikSAS
 *
 */

const name = 'decrypt'
import requestPasswordHTML from './requestPassword.html'

const template = document.createElement('template')
template.innerHTML = requestPasswordHTML

const loadExtensionTranslation = async function (svgEditor) {
  let translationModule
  const lang = svgEditor.configObj.pref('lang')
  try {
    translationModule = await import(`./locale/${lang}.js`)
  } catch (_error) {
    console.warn(`Missing translation (${lang}) for ${name} - using 'en'`)
    translationModule = await import('../ext-decrypt/locale/en.js')
  }
  svgEditor.i18next.addResourceBundle(lang, name, translationModule.default)
}

const decrypt = async function (data){
    //if (isBase64(data)){
      try{
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        const concatenatedArray = Uint8Array.from(atob(data), c => c.charCodeAt(0));

        // Extract the components
        const saltLength = 16; // Assuming salt is 16 bytes
        const ivLength = 16;   // Assuming IV is 16 bytes
        const salt = concatenatedArray.slice(0, saltLength);
        const iv = concatenatedArray.slice(saltLength, saltLength + ivLength);
        const encryptedData = concatenatedArray.slice(saltLength + ivLength);

        // Convert the password to a Uint8Array
        const passwordBuffer = encoder.encode(svgEditor.password);

        // Derive the key material from the password
        const keyMaterial = await crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        // Derive the AES key using the same parameters as encryption
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
            ["decrypt"]
        );

        // Decrypt the data
        const decryptedData = await crypto.subtle.decrypt(
            { name: "AES-CBC", iv },
            aesKey,
            encryptedData
        );

        // Convert decrypted data back to a string
        return decoder.decode(decryptedData)}
        catch{
          //decryption fails indicating incorrect password
          pwdDialog()
          const dialog = document.getElementById('se-password-request-dialog')
          dialog._shadowRoot.querySelector('#clear').removeAttribute('hidden')
          /*if (svgEditor.password!== null)
          {
          const dialog = document.getElementById('se-password-request-dialog')
          dialog.getElementById('clear').setAttribute('display', 'block')
          }*/
        }
    /*}

    else {
        return data
    }*/
    
}

/*const isBase64 = function (str) {
    try {
        // Decode the string and re-encode it to see if it matches
        return btoa(atob(str)) === str
    } catch (err) {
        return false // Not Base64 encoded
    }
}*/

const pwdDialog = function(){
  const pwdReqDialog = document.createElement('se-password-request-dialog')
  pwdReqDialog.setAttribute('id', 'se-password-request-dialog')
  document.getElementById('container').append(pwdReqDialog)
  pwdReqDialog.init(svgEditor.i18next)
  document.getElementById('se-password-request-dialog').setAttribute('dialog', 'open')
  //const dialog = document.getElementById('se-password-request-dialog')
  //dialog._shadowRoot.querySelector('#clear').setAttribute('hidden', 'hidden')
}


/**
 * @class SeLabelDialog
 */
export class SePasswordRequestDialog extends HTMLElement {
  /**
    * @function constructor
    */
  constructor () {
    super()
    // create the shadowDom and insert the template
    this._shadowRoot = this.attachShadow({ mode: 'open' })
    this._shadowRoot.append(template.content.cloneNode(true))
    this.$dialog = this._shadowRoot.querySelector('#password_value_box')
    this.$submitBtn = this._shadowRoot.querySelector('#submit')
    this.$passwordVal = this._shadowRoot.querySelector('#password_value')
    this.$clearBtn = this._shadowRoot.querySelector('#clear')
  }

  /**
   * @function init
   * @param {any} name
   * @returns {void}
   */
  init (i18next) {
    this.setAttribute('label-ok', i18next.t(`common.ok`))
    this.setAttribute('label-pwd', i18next.t(`${name}:values.password_val`))
    this.setAttribute('label-clear', i18next.t(`${name}:values.clear_val` ))
  }

  /**
   * @function observedAttributes
   * @returns {any} observed
   */
  static get observedAttributes () {
    return ['dialog', 'label-ok', 'label-pwd',  'pwd_val', 'label-clear']
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
          this._shadowRoot.querySelector('#password_value').value = svgEditor.password
          this.$dialog.open()
        } else {
          svgEditor.password = this._shadowRoot.querySelector('#password_value').value
          this.$dialog.close()
        }
        break
      case 'label-ok':
        this.$submitBtn.textContent = newValue
        break
      case 'label-clear':
        this.$clearBtn.textContent = newValue
        break
      case 'label-pwd':
        node = this._shadowRoot.querySelector('#password_value_prompt')
        node.textContent = newValue
        break
      case 'pwd_val':
        node = this._shadowRoot.querySelector('#password_value')
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
  const { svgCanvas, storage } = svgEditor
  const { $id, $click } = svgCanvas
  const onSaveHandler = function (){
    document.getElementById('se-password-request-dialog').setAttribute('dialog', 'close')
    svgCanvas.runExtensions('readStorage')
  }

  const onClearHandler = function() {
    storage.removeItem('svgedit-default')
    storage.removeItem('tat-storage-data')
  }

  svgEditor.$click(this.$submitBtn, onSaveHandler)
  svgEditor.$click(this.$clearBtn, onClearHandler)
}
}

// Register
customElements.define('se-password-request-dialog', SePasswordRequestDialog)  

export default {
  name,
  async init () {
    const svgEditor = this
    const { svgCanvas } = svgEditor
    const svgroot = svgCanvas.getSvgRoot()
    await loadExtensionTranslation(svgEditor)
    // const { ChangeElementCommand } = svgCanvas.history
    // svgdoc = S.svgroot.parentNode.ownerDocument,
    // const addToHistory = (cmd) => { svgCanvas.undoMgr.addCommandToHistory(cmd) }
    const { $id, $click } = svgCanvas


    return {
      name: svgEditor.i18next.t(`${name}:name`),
      decryptData(data){
        //console.warn(data)
        return decrypt(data)
      },
      callback () {
        // Add the button and its handler(s)
        /*const pwdReqDialog = document.createElement('se-password-request-dialog')
        pwdReqDialog.setAttribute('id', 'se-password-request-dialog')
        document.getElementById('container').append(pwdReqDialog)
        pwdReqDialog.init(svgEditor.i18next)
        document.getElementById('se-password-request-dialog').setAttribute('dialog', 'open')*/
        pwdDialog()
      }
    }
  }
}