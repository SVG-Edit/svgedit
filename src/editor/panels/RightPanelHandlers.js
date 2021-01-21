import SvgCanvas from '../../svgcanvas/svgcanvas.js';

const SIDEPANEL_OPENWIDTH = 150;
const {$id, $qa} = SvgCanvas;

/**
 * Register actions for right panel
 */
class RightPanelHandlers {
  /**
   * @param {PlainObject} editor svgedit handler
   */
  constructor (editor) {
    this.editor = editor;
    this.svgCanvas = editor.svgCanvas;

    this.sidedrag = -1;
    this.sidedragging = false;
    this.allowmove = false;
  }

  /**
   * This is a common function used when a button has been clicked. If a button is clicked when already active, the
   * buttons pressed state is removed.
   * It does several common things:
   * - Removes the pressed button from whatever button currently has it.
   * - Adds the the pressed button to the button passed in.
   * @function this.updatePanel
   * @param {string|Element} button The DOM element or string selector representing the toolbar button
   * @returns {boolean} Whether the button was disabled or not
   */
  // eslint-disable-next-line class-methods-use-this
  updatePanelButtons (button) {
    if (button.disabled) return false;

    // If we click the same button we want to remove the pressed state
    if ($id(button).pressed) {
      $qa('#panel_right *[pressed]').forEach((b) => {
        b.pressed = false;
      });
      return true;
    }

    // remove the pressed state on other(s) button(s)
    $qa('#panel_right *[pressed]').forEach((b) => {
      b.pressed = false;
    });

    // pressed state for the clicked button
    $id(button).pressed = true;
    return true;
  }

  /**
   * Toggles the right side panel flyout. If the target panel is already open we want to close it.
   * @param panelContent ID of the panel that should be opened
   */
  toggleSidePanelFlyout (panelContent) {
    const panelRightFlyout = $('#panel_right_flyout');

    // Check if the user clicked the button for the actually opened side panel -> then close the panel.
    const curOpenedSidePanel = panelRightFlyout.find('.side_panel_open');
    if (curOpenedSidePanel.length > 0 && curOpenedSidePanel[0].id === panelContent) {
      this.changeSidePanelWidth(panelRightFlyout.width() * -1);
      panelRightFlyout.find('div').removeClass('side_panel_open');
      return;
    }

    // Hide the actually visible side panel
    panelRightFlyout.find('div').removeClass('side_panel_open');

    // If the side panel is closed we need to open it
    const isOpened = panelRightFlyout.width() > 0;
    if (!isOpened) {
      const dpr = window.devicePixelRatio || 1;
      const zoomAdjustedSidepanelWidth = (dpr < 1 ? 1 : dpr) * SIDEPANEL_OPENWIDTH;
      this.changeSidePanelWidth(zoomAdjustedSidepanelWidth);
    }

    // Show the target side panel
    $('#' + panelContent).addClass('side_panel_open');
  }

  /**
   * Changes the width of the side panel flyout.
   * @param {Float} delta
   * @fires module:svgcanvas.SvgCanvas#event:ext_workareaResized
   * @returns {void}
   */
  changeSidePanelWidth (delta) {
    const rulerX = $('#ruler_x');
    $('#panel_right_flyout').width('+=' + delta);
    rulerX.css('right', Number.parseInt(rulerX.css('right')) + delta);
    this.editor.workarea.css('right', Number.parseInt(this.editor.workarea.css('right')) + delta);
    this.svgCanvas.runExtensions('workareaResized');
  }

  /**
   * Resizes the side panel flyout when dragging it with the mouse.
   * @param {Event} evt
   * @returns {void}
   */
  resizeSidePanel (evt) {
    if (!this.allowmove) { return; }
    if (this.sidedrag === -1) { return; }
    this.sidedragging = true;
    let deltaX = this.sidedrag - evt.pageX;
    const sideWidth = $('#panel_right_flyout').width();
    if (sideWidth + deltaX < 2) {
      deltaX = 2 - sideWidth;
      // sideWidth = 2;
    }
    if (deltaX === 0) { return; }
    this.sidedrag -= deltaX;
    this.changeSidePanelWidth(deltaX);
  }

  /**
   * Method that should be executed when the objects panel button is clicked. It opens the panel and set the pressed
   * state to the button.
   */
  clickObjectsPanel () {
    if (this.updatePanelButtons('panel_right_objects_button')) {
      this.toggleSidePanelFlyout('panel_right_objects');
    }
  }

  /**
   * Initialize this handler and adds all needed event listeners
   */
  init () {
    // Register all buttons
    $id('panel_right_objects_button').addEventListener('click', this.clickObjectsPanel.bind(this));

    // Register the resizer
    $id('panel_right_resizer').addEventListener('mousedown', (evt) => {
      this.sidedrag = evt.pageX;
      window.addEventListener('mousemove', this.resizeSidePanel.bind(this));
      this.allowmove = false;
      // Silly hack for Chrome, which always runs mousemove right after mousedown
      setTimeout(() => {
        this.allowmove = true;
      }, 20);
    });
    $id('panel_right_resizer').addEventListener('mouseup', (evt) => {
      if (!this.sidedragging) { this.toggleSidePanel(); }
      this.sidedrag = -1;
      this.sidedragging = false;
    });
    window.addEventListener('mouseup', (evt) => {
      this.sidedrag = -1;
      this.sidedragging = false;
      $id('svg_editor').removeEventListener('mousemove', this.resizeSidePanel.bind(this));
    });

    // Show initially the objects if it is configured
    if (this.editor.configObj.curConfig.showObjectsPanel) {
      this.toggleSidePanelFlyout('panel_right_objects');
    }
  }
}

export default RightPanelHandlers;
