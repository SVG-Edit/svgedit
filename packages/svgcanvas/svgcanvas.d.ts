/**
 * TypeScript definitions for @svgedit/svgcanvas
 * @module @svgedit/svgcanvas
 */

// Core types
export interface SVGElementJSON {
  element: string
  attr: Record<string, string>
  curStyles?: boolean
  children?: SVGElementJSON[]
  namespace?: string
}

export interface Config {
  canvasName?: string
  canvas_expansion?: number
  initFill?: {
    color?: string
    opacity?: number
  }
  initStroke?: {
    width?: number
    color?: string
    opacity?: number
  }
  text?: {
    stroke_width?: number
    font_size?: number
    font_family?: string
  }
  selectionColor?: string
  imgPath?: string
  extensions?: string[]
  initTool?: string
  wireframe?: boolean
  showlayers?: boolean
  no_save_warning?: boolean
  imgImport?: boolean
  baseUnit?: string
  snappingStep?: number
  gridSnapping?: boolean
  gridColor?: string
  dimensions?: [number, number]
  initOpacity?: number
  colorPickerCSS?: string | null
  initRight?: string
  initBottom?: string
  show_outside_canvas?: boolean
  selectNew?: boolean
}

export interface Resolution {
  w: number
  h: number
  zoom?: number
}

export interface BBox {
  x: number
  y: number
  width: number
  height: number
}

export interface EditorContext {
  getSvgContent(): SVGSVGElement
  addSVGElementsFromJson(data: SVGElementJSON): Element
  getSelectedElements(): Element[]
  getDOMDocument(): HTMLDocument
  getDOMContainer(): HTMLElement
  getSvgRoot(): SVGSVGElement
  getBaseUnit(): string
  getSnappingStep(): number | string
}

// Paint types
export interface PaintOptions {
  alpha?: number
  solidColor?: string
  type?: 'solidColor' | 'linearGradient' | 'radialGradient' | 'none'
}

// History command types
export interface HistoryCommand {
  apply(handler: HistoryEventHandler): void | true
  unapply(handler: HistoryEventHandler): void | true
  elements(): Element[]
  type(): string
}

export interface HistoryEventHandler {
  handleHistoryEvent(eventType: string, cmd: HistoryCommand): void
}

export interface UndoManager {
  getUndoStackSize(): number
  getRedoStackSize(): number
  getNextUndoCommandText(): string
  getNextRedoCommandText(): string
  resetUndoStack(): void
}

// Logger types
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4
}

export interface Logger {
  LogLevel: typeof LogLevel
  setLogLevel(level: LogLevel): void
  setLoggingEnabled(enabled: boolean): void
  setLogPrefix(prefix: string): void
  error(message: string, error?: Error | any, context?: string): void
  warn(message: string, data?: any, context?: string): void
  info(message: string, data?: any, context?: string): void
  debug(message: string, data?: any, context?: string): void
  getConfig(): { currentLevel: LogLevel; enabled: boolean; prefix: string }
}

// Main SvgCanvas class
export default class SvgCanvas {
  constructor(container: HTMLElement, config?: Partial<Config>)
  
  // Core methods
  getSvgContent(): SVGSVGElement
  getSvgRoot(): SVGSVGElement
  getSvgString(): string
  setSvgString(xmlString: string, preventUndo?: boolean): boolean
  clearSelection(noCall?: boolean): void
  selectOnly(elements: Element[], showGrips?: boolean): void
  getResolution(): Resolution
  setResolution(width: number | string, height: number | string): boolean
  getZoom(): number
  setZoom(zoomLevel: number): void
  
  // Element manipulation
  moveSelectedElements(dx: number, dy: number, undoable?: boolean): void
  deleteSelectedElements(): void
  cutSelectedElements(): void
  copySelectedElements(): void
  pasteElements(type?: string, x?: number, y?: number): void
  groupSelectedElements(type?: string, urlArg?: string): Element | null
  ungroupSelectedElement(): void
  moveToTopSelectedElement(): void
  moveToBottomSelectedElement(): void
  moveUpDownSelected(dir: 'Up' | 'Down'): void
  
  // Path operations
  pathActions: {
    clear: () => void
    resetOrientation: (path: SVGPathElement) => boolean
    zoomChange: () => void
    getNodePoint: () => {x: number, y: number}
    linkControlPoints: (linkPoints: boolean) => void
    clonePathNode: () => void
    deletePathNode: () => void
    smoothPolylineIntoPath: () => void
    setSegType: (type: number) => void
    moveNode: (attr: string, newValue: number) => void
    selectNode: (node?: Element) => void
    opencloseSubPath: () => void
  }
  
  // Layer operations
  getCurrentDrawing(): any
  getNumLayers(): number
  getLayer(name: string): any
  getCurrentLayerName(): string
  setCurrentLayer(name: string): boolean
  renameCurrentLayer(newName: string): boolean
  setCurrentLayerPosition(newPos: number): boolean
  setLayerVisibility(name: string, bVisible: boolean): void
  moveSelectedToLayer(layerName: string): void
  cloneLayer(name?: string): void
  deleteCurrentLayer(): boolean
  
  // Drawing modes
  setMode(name: string): void
  getMode(): string
  
  // Undo/Redo
  undoMgr: UndoManager
  undo(): void
  redo(): void
  
  // Events
  call(event: string, args?: any[]): void
  bind(event: string, callback: Function): void
  unbind(event: string, callback: Function): void
  
  // Attribute manipulation
  changeSelectedAttribute(attr: string, val: string | number, elems?: Element[]): void
  changeSelectedAttributeNoUndo(attr: string, val: string | number, elems?: Element[]): void
  
  // Canvas properties
  contentW: number
  contentH: number
  
  // Text operations
  textActions: any
  
  // Extensions
  addExtension(name: string, extFunc: Function): void
  
  // Export
  getSvgString(): string
  embedImage(dataURI: string): Promise<Element>
  
  // Other utilities
  getPrivateMethods(): any
}

// Export additional utilities
export * from './common/logger.js'
export { NS } from './core/namespaces.js'
export * from './core/math.js'
export * from './core/units.js'
export * from './core/utilities.js'
export { sanitizeSvg } from './core/sanitize.js'
export { default as dataStorage } from './core/dataStorage.js'
