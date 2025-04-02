declare module "@dessixio/svgcanvas" {
  /**
   * 绘制属性接口,定义了 SVG 元素的绘制样式
   */
  interface Paint {
    /**
     * 绘制类型
     */
    type: "solidColor" | "linearGradient" | "radialGradient" | "pattern" | string;
    /**
     * 绘制值
     */
    value: string;
    /**
     * 不透明度
     */
    opacity?: number;
    /**
     * 渐变停止点
     */
    gradientStops?: Array<{
      /**
       * 偏移量
       */
      offset: number;
      /**
       * 颜色
       */
      color: string;
      /**
       * 不透明度
       */
      opacity: number;
    }>;
    /**
     * 变换矩阵
     */
    matrix?: SVGMatrix;
  }

  /**
   * 事件处理器类型
   */
  type EventHandler = (window: Window, arg?: any) => any;

  /**
   * 样式选项接口,定义了元素的样式属性
   */
  interface StyleOptions {
    /**
     * 填充颜色
     */
    fill: string;
    /**
     * 填充绘制属性
     */
    fill_paint: Paint | null;
    /**
     * 填充不透明度
     */
    fill_opacity: string | number;
    /**
     * 描边颜色
     */
    stroke: string;
    /**
     * 描边绘制属性
     */
    stroke_paint: Paint | null;
    /**
     * 描边不透明度
     */
    stroke_opacity: string | number;
    /**
     * 描边宽度
     */
    stroke_width: string | number;
    /**
     * 描边虚线模式
     */
    stroke_dasharray: string;
    /**
     * 描边连接方式
     */
    stroke_linejoin: "miter" | "round" | "bevel" | string;
    /**
     * 描边端点样式
     */
    stroke_linecap: "butt" | "round" | "square" | string;
    /**
     * 整体不透明度
     */
    opacity: string | number;
    /**
     * 字体大小
     */
    font_size?: string | number;
    /**
     * 字体族
     */
    font_family?: string;
    /**
     * 文本锚点
     */
    text_anchor?: "start" | "middle" | "end" | string;
  }

  /**
   * 绘图操作接口,提供图层相关的操作方法
   */
  interface DrawingOptions {
    /**
     * 获取当前图层
     * @returns {SVGGElement} 当前图层元素
     */
    getCurrentLayer: () => SVGGElement;

    /**
     * 获取当前图层名称
     * @returns {string} 图层名称
     */
    getCurrentLayerName: () => string;

    /**
     * 设置当前图层
     * @param {string} name - 图层名称
     */
    setCurrentLayer: (name: string) => void;

    /**
     * 获取当前绘图对象
     * @returns {any} 绘图对象
     */
    getCurrentDrawing: () => any;

    /**
     * 获取图层数量
     * @returns {number} 图层数量
     */
    getNumLayers: () => number;

    /**
     * 获取指定名称的图层
     * @param {string} name - 图层名称
     * @returns {SVGGElement} 图层元素
     */
    getLayer: (name: string) => SVGGElement;

    /**
     * 获取指定索引的图层名称
     * @param {number} index - 图层索引
     * @returns {string} 图层名称
     */
    getLayerName: (index: number) => string;

    /**
     * 获取当前图层位置
     * @returns {number} 图层位置索引
     */
    getCurrentLayerPosition: () => number;

    /**
     * 设置当前图层位置
     * @param {number} pos - 新的位置索引
     */
    setCurrentLayerPosition: (pos: number) => void;

    /**
     * 获取图层可见性
     * @param {string} name - 图层名称
     * @returns {boolean} 是否可见
     */
    getLayerVisibility: (name: string) => boolean;

    /**
     * 设置图层可见性
     * @param {string} name - 图层名称
     * @param {boolean} visibility - 是否可见
     */
    setLayerVisibility: (name: string, visibility: boolean) => void;

    /**
     * 将选中的元素移动到指定图层
     * @param {string} name - 目标图层名称
     */
    moveSelectedToLayer: (name: string) => void;

    /**
     * 合并指定图层
     * @param {string} name - 要合并的图层名称
     */
    mergeLayer: (name: string) => void;

    /**
     * 合并所有图层
     * @returns {SVGGElement} 合并后的图层元素
     */
    mergeAllLayers: () => SVGGElement;

    /**
     * 离开当前上下文
     */
    leaveContext: () => void;

    /**
     * 设置上下文
     * @param {SVGGElement} elem - 上下文元素
     */
    setContext: (elem: SVGGElement) => void;

    /**
     * 获取 ID
     * @returns {string} ID
     */
    getId: () => string;

    /**
     * 获取 nonce
     * @returns {string} nonce 值
     */
    getNonce: () => string;
  }

  /**
   * SVG 画布配置接口
   */
  export interface SvgCanvasConfig {
    /**
     * 是否显示画布外的内容
     */
    show_outside_canvas?: boolean;
    /**
     * 是否自动选中新创建的元素
     */
    selectNew?: boolean;
    /**
     * 画布尺寸 [宽度, 高度]
     */
    dimensions?: [number | string, number | string];
    /**
     * 图片路径
     */
    imgPath?: string;
    /**
     * 基本单位
     */
    baseUnit?: string;
    /**
     * 对齐步长
     */
    snappingStep?: number;
    /**
     */
    showRulers?: boolean;
    /**
     * 是否启用网格对齐
     */
    gridSnapping?: boolean;
    /**
     * 初始填充设置
     */
    initFill?: {
      /**
       * 颜色
       */
      color: string;
      /**
       * 不透明度
       */
      opacity: number;
    };
    /**
     * 初始描边设置
     */
    initStroke?: {
      /**
       * 颜色
       */
      color: string;
      /**
       * 不透明度
       */
      opacity: number;
      /**
       * 宽度
       */
      width: number;
    };
    /**
     * 初始不透明度
     */
    initOpacity?: number;
    /**
     * 文本设置
     */
    text?: {
      /**
       * 描边宽度
       */
      stroke_width?: number;
      /**
       * 字体大小
       */
      font_size?: number;
      /**
       * 字体族
       */
      font_family?: string;
    };
  }

  /**
   * 历史事件类型枚举
   */
  enum HistoryEventTypes {
    /**
     * 应用命令前
     */
    BEFORE_APPLY = "before_apply",
    /**
     * 应用命令后
     */
    AFTER_APPLY = "after_apply",
    /**
     * 取消应用命令前
     */
    BEFORE_UNAPPLY = "before_unapply",
    /**
     * 取消应用命令后
     */
    AFTER_UNAPPLY = "after_unapply",
  }

  /**
   * 历史命令接口
   */
  interface HistoryCommand {
    /**
     * 应用命令
     */
    apply(): void;

    /**
     * 取消应用命令
     */
    unapply(): void;

    /**
     * 获取命令元素
     * @returns {Element[]} 命令相关的元素数组
     */
    elements(): Element[];

    /**
     * 获取命令类型
     * @returns {string} 命令类型
     */
    type(): string;

    /**
     * 获取命令文本
     * @returns {string} 命令描述文本
     */
    text(): string;

    /**
     * 相关元素
     */
    elem?: Element;
    /**
     * 旧值
     */
    oldValues?: any;
    /**
     * 新值
     */
    newValues?: any;
    /**
     * 旧父元素
     */
    oldParent?: Element;
    /**
     * 新父元素
     */
    newParent?: Element;
    /**
     * 父元素
     */
    parent?: Element;
  }

  /**
   * 批处理命令接口,用于管理一组相关的命令操作
   */
  interface BatchCommand {
    /**
     * 批处理命令的类型
     */
    type: string;

    /**
     * 添加子命令
     * @param {HistoryCommand} cmd - 要添加的命令
     */
    addSubCommand(cmd: HistoryCommand): void;

    /**
     * 检查批处理命令是否为空
     * @returns {boolean} 如果没有子命令则返回 true
     */
    isEmpty(): boolean;

    /**
     * 应用所有子命令
     */
    apply(): void;

    /**
     * 取消应用所有子命令
     */
    unapply(): void;

    /**
     * 获取所有相关元素
     * @returns {Element[]} 命令相关的元素数组
     */
    elements(): Element[];

    /**
     * 获取命令描述文本
     * @returns {string} 命令描述
     */
    getText(): string;
  }

  /**
   * SVG 画布主类,管理所有 SVG 相关功能
   * 提供了完整的 SVG 编辑器功能,包括:
   * - SVG 元素的创建、编辑和删除
   * - 路径绘制和编辑
   * - 图层管理
   * - 变换操作(旋转、缩放、平移等)
   * - 样式设置
   * - 撤销/重做
   * - 剪切板操作
   * - 扩展机制
   * @memberof module:svgcanvas
   */
  class SvgCanvas {
    /**
     * 创建一个新的 SVG 画布实例
     * @param {HTMLElement} container - 用于容纳 SVG 根元素的 HTML 容器元素
     * @param {SvgCanvasConfig} config - 画布配置选项
     */
    constructor(container: HTMLElement, config?: SvgCanvasConfig);

    container: HTMLElement;

    // 事件管理
    bind(eventName: string, callback: EventHandler): EventHandler | undefined;

    call(eventName: string, arg?: any): any;

    // SVG内容管理
    getSvgString(): string;

    setSvgString(svgString: string, preventUndo?: boolean): boolean;

    svgCanvasToString(): string;

    // 配置管理
    getSvgOption(): Record<string, any>;

    setSvgOption(key: string, value: any): void;

    setConfig(options: Record<string, any>): void;

    getCurConfig(): Record<string, any>;

    setUiStrings(strings: Record<string, any>): void;

    getUIStrings(): Record<string, any>;

    // 元素选择管理
    getSelectedElements(): Element[];

    setSelectedElements(key: number, value: Element): void;

    setEmptySelectedElements(): void;

    /**
     * 清除当前选中的所有元素
     * @param {boolean} [noCall] - 是否不触发 changed 事件
     */
    clearSelection(noCall?: boolean): void;

    /**
     * 将元素添加到当前选中集合中
     * @param {Element[]} elements - 要添加到选中集合的元素数组
     * @param {boolean} [showGrips] - 是否显示控制点
     */
    addToSelection(elements: Element[], showGrips?: boolean): void;

    /**
     * 只选中指定的元素,取消其他所有选中状态
     * @param {Element[]} elements - 要选中的元素数组
     * @param {boolean} [showGrips] - 是否显示控制点
     */
    selectOnly(elements: Element[], showGrips?: boolean): void;

    /**
     * 从当前选中集合中移除指定元素
     * @param {Element[]} elements - 要移除的元素数组
     */
    removeFromSelection(elements: Element[]): void;

    /**
     * 选中当前图层中的所有元素
     */
    selectAllInCurrentLayer(): void;

    // 元素创建和操作
    createSVGElement(jsonMap: Record<string, any>): SVGElement;

    /**
     * 从 SVG 元素获取 JSON 表示
     * @param {Element[]} elements - 要转换的 SVG 元素数组
     * @returns {Record<string, any>[]} 包含元素属性的 JSON 对象数组
     */
    getJsonFromSvgElements(elements: Element[]): Record<string, any>[];

    /**
     * 从 JSON 数据创建 SVG 元素
     * @param {Record<string, any>} json - 包含元素属性的 JSON 对象
     * @returns {SVGElement} 创建的 SVG 元素
     */
    addSVGElementsFromJson(json: Record<string, any>): SVGElement;

    // 元素转换和修改
    /**
     * 将选中的元素转换为路径
     * @param {Element} elem - 要转换的 DOM 元素
     * @param {boolean} [getBBox] - 是否只返回路径的边界框
     * @returns {SVGPathElement | DOMRect | null} 转换后的路径元素或边界框
     */
    convertToPath(elem: Element, getBBox?: boolean): SVGPathElement | DOMRect | null;

    /**
     * 更改选中元素的属性
     * @param {string} attr - 属性名
     * @param {string | number} val - 属性值
     * @param {Element[]} [elems] - 要更改的元素数组
     * @returns {boolean} 是否更改成功
     */
    changeSelectedAttribute(attr: string, val: string | number, elems?: Element[]): boolean;

    /**
     * 更改选中元素的属性(无撤销)
     * @param {string} attr - 属性名
     * @param {string | number} val - 属性值
     * @param {Element[]} [elems] - 要更改的元素数组
     * @returns {boolean} 是否更改成功
     */
    changeSelectedAttributeNoUndo(attr: string, val: string | number, elems?: Element[]): boolean;

    // 编辑操作
    /**
     * 剪切选中的元素
     */
    cutSelectedElements(): void;

    /**
     * 将选中的元素复制到剪贴板
     * @fires module:selected-elem.SvgCanvas#event:changed
     */
    copySelectedElements(): void;

    /**
     * 粘贴元素
     * @param {string} [type] - 粘贴类型
     * @param {number} [x] - x 坐标
     * @param {number} [y] - y 坐标
     */
    pasteElements(type?: string, x?: number, y?: number): void;

    /**
     * 将所有选中的元素包装到一个组(`g`)元素中
     * @param {"a"|"g"} [type="g"] - 要组合成的元素类型,默认为 `<g>`
     * @param {string} [urlArg] - 如果类型是 "a",则为链接 URL
     * @returns {void}
     */
    groupSelectedElements(type?: "a" | "g", urlArg?: string): void;

    /**
     * 将所有适当的父组属性下推到其子元素,然后从组中删除它们
     * @param {SVGAElement|SVGGElement} g - 组元素
     * @param {boolean} undoable - 是否可撤销
     * @returns {BatchCommand|void} 批处理命令对象
     */
    pushGroupProperties(g: SVGAElement | SVGGElement, undoable: boolean): BatchCommand | void;

    /**
     * 解除选中组(`g`)元素中所有元素的组合
     * @fires module:selected-elem.SvgCanvas#event:changed
     * @returns {void}
     */
    ungroupSelectedElement(): void;

    /**
     * 将选中的元素重新定位到 DOM 中的底部以显示在顶部
     * @fires module:selected-elem.SvgCanvas#event:changed
     * @returns {void}
     */
    moveToTopSelectedElement(): void;

    /**
     * 将选中的元素重新定位到 DOM 中的顶部以显示在其他元素下方
     * @fires module:selected-elem.SvgCanvas#event:changed
     * @returns {void}
     */
    moveToBottomSelectedElement(): void;

    /**
     * 根据可见的相交元素,将选中的元素在堆栈中上移或下移
     * @param {"Up"|"Down"} dir - 表示 'Up' 或 'Down' 的字符串
     * @fires module:selected-elem.SvgCanvas#event:changed
     * @returns {void}
     */
    moveUpDownSelected(dir: "Up" | "Down"): void;

    /**
     * 在 X/Y 轴上移动选中的元素
     * @param {number} dx - X 轴移动距离
     * @param {number} dy - Y 轴移动距离
     * @param {boolean} [undoable=true] - 是否可撤销
     * @fires module:selected-elem.SvgCanvas#event:changed
     * @returns {BatchCommand|void} 移动的批处理命令
     */
    moveSelectedElements(dx: number, dy: number, undoable?: boolean): BatchCommand | void;

    /**
     * 创建所有选中元素的深层 DOM 副本(克隆)并稍微移动它们
     * @param {number} x - X 轴移动距离
     * @param {number} y - Y 轴移动距离
     * @returns {void}
     */
    cloneSelectedElements(x: number, y: number): void;

    /**
     * 对齐选中的元素
     * @param {string} type - 表示对齐类型的单个字符
     * @param {"selected"|"largest"|"smallest"|"page"} relativeTo - 相对对齐的参考
     * @returns {void}
     */
    alignSelectedElements(
      type: string,
      relativeTo: "selected" | "largest" | "smallest" | "page"
    ): void;

    /**
     * 在缩放后更新编辑器画布的宽度/高度/位置
     * @param {number} w - 新宽度
     * @param {number} h - 新高度
     * @fires module:svgcanvas.SvgCanvas#event:ext_canvasUpdated
     * @returns {CanvasInfo} 画布信息对象
     */
    updateCanvas(
      w: number,
      h: number
    ): {
      x: number;
      y: number;
      old_x: number;
      old_y: number;
      d_x: number;
      d_y: number;
    };

    /**
     * 在当前图层中选择下一个/上一个元素
     * @param {boolean} next - true = 下一个元素, false = 上一个元素
     * @fires module:svgcanvas.SvgCanvas#event:selected
     * @returns {void}
     */
    cycleElement(next: boolean): void;

    /**
     * 从 DOM 中删除所有选中的元素并将更改添加到历史记录中
     * @fires module:selected-elem.SvgCanvas#event:changed
     * @returns {void}
     */
    deleteSelectedElements(): void;

    // 撤销/重做
    /**
     * 添加命令到历史记录
     * @param {HistoryCommand} cmd - 命令对象
     */
    addCommandToHistory(cmd: HistoryCommand): void;

    // 视图和缩放
    /**
     * 获取当前缩放比例
     * @returns {number} 当前缩放比例
     */
    getZoom(): number;

    /**
     * 设置缩放比例
     * @param {number} value - 新的缩放比例
     */
    setZoom(value: number): void;

    setColor(type: string, color: string, noUndo: boolean): void;

    /**
     * 获取当前编辑模式
     * @returns {string} 当前模式名称
     */
    getMode(): string;

    /**
     * 设置编辑模式
     * @param {string} name - 模式名称
     */
    setMode(name: string): void;

    round(val: number): number;

    // 获取画布和元素信息
    /**
     * 获取画布分辨率
     * @returns {{ w: number; h: number }} 画布的宽度和高度
     */
    getResolution(): { w: number; h: number };

    /**
     * 设置画布分辨率
     * @param {number} width - 宽度
     * @param {number} height - 高度
     */
    setResolution(width: number, height: number): void;

    /**
     * 获取画布宽度
     * @returns {number} 画布宽度
     */
    getWidth(): number;

    /**
     * 获取画布高度
     * @returns {number} 画布高度
     */
    getHeight(): number;

    /**
     * 获取当前 SVG 内容的字符串表示
     * @returns {string} SVG 字符串
     */
    getSvgString(): string;

    /**
     * 获取 SVG 根元素
     * @returns {SVGSVGElement} SVG 根元素
     */
    getSvgRoot(): SVGSVGElement;

    /**
     * 获取 SVG 内容元素
     * @returns {SVGSVGElement} SVG 内容元素
     */
    getSvgContent(): SVGSVGElement;

    getDOMDocument(): Document;

    getDOMContainer(): HTMLElement;

    getContainer(): HTMLElement;

    // ID和前缀管理
    getIdPrefix(): string;

    /**
     * 设置 ID 前缀
     * @param {string} p - 新的 ID 前缀
     */
    setIdPrefix(p: string): void;

    /**
     * 获取下一个可用的 ID
     * @returns {string} 新的唯一 ID
     */
    getNextId(): string;

    getId(): string;

    /**
     * 随机化 ID
     * @param {boolean} [enableRandomization] - 是否启用随机化
     */
    randomizeIds(enableRandomization?: boolean): void;

    // 图层操作
    /**
     * 获取当前绘图对象
     * @returns {DrawingOptions} 当前绘图对象
     */
    getCurrentDrawing(): DrawingOptions;

    /**
     * 创建新图层
     * @param {string} [name] - 图层名称
     * @returns {SVGGElement} 创建的图层元素
     */
    createLayer(name?: string): SVGGElement;

    identifyLayers(): void;

    cloneLayer(name?: string): SVGGElement | null;

    /**
     * 删除当前图层
     * @returns {boolean} 是否删除成功
     */
    deleteCurrentLayer(): boolean;

    /**
     * 设置当前图层
     * @param {string} name - 图层名称
     */
    setCurrentLayer(name: string): void;

    /**
     * 重命名当前图层
     * @param {string} newName - 新的图层名称
     */
    renameCurrentLayer(newName: string): void;

    /**
     * 设置当前图层的位置
     * @param {number} pos - 新的位置索引
     */
    setCurrentLayerPosition(pos: number): void;

    indexCurrentLayer(): number;

    /**
     * 设置图层的可见性
     * @param {string} name - 图层名称
     * @param {boolean} visibility - 是否可见
     */
    setLayerVisibility(name: string, visibility: boolean): void;

    /**
     * 将选中的元素移动到指定图层
     * @param {string} name - 目标图层名称
     */
    moveSelectedToLayer(name: string): void;

    /**
     * 合并指定图层
     * @param {string} name - 要合并的图层名称
     */
    mergeLayer(name: string): void;

    /**
     * 合并所有图层
     * @returns {SVGGElement} 合并后的图层元素
     */
    mergeAllLayers(): SVGGElement;

    // 组操作
    setContext(elem: SVGGElement): void;

    leaveContext(): void;

    /**
     * 获取当前组
     * @returns {SVGGElement | null} 当前组元素
     */
    getCurrentGroup(): SVGGElement | null;

    /**
     * 设置当前组
     * @param {SVGGElement | null} cg - 组元素
     */
    setCurrentGroup(cg: SVGGElement | null): void;

    // 样式和属性
    getOpacity(): string | number;

    setOpacity(val: string | number): void;

    /**
     * 获取元素的模糊值
     * @param {Element} elem - 要检查的元素
     * @returns {string} 模糊值(stdDeviation)
     */
    getBlur(elem: Element): string;

    /**
     * 设置元素的模糊效果
     * @param {number} val - 模糊值
     * @param {boolean} [complete] - 是否完成操作
     */
    setBlur(val: number, complete?: boolean): void;

    /**
     * 获取指定类型的颜色值
     * @param {"fill" | "stroke"} type - 颜色类型
     * @returns {string} 颜色值
     */
    getColor(type: "fill" | "stroke"): string;

    /**
     * 设置描边的绘制属性
     * @param {Paint} paint - 绘制属性
     */
    setStrokePaint(paint: Paint): void;

    /**
     * 设置填充的绘制属性
     * @param {Paint} paint - 绘制属性
     */
    setFillPaint(paint: Paint): void;

    /**
     * 获取描边宽度
     * @returns {number | string} 描边宽度
     */
    getStrokeWidth(): number | string;

    /**
     * 获取当前样式
     * @returns {StyleOptions} 样式选项
     */
    getStyle(): StyleOptions;

    /**
     * 获取填充不透明度
     * @returns {number} 填充不透明度值
     */
    getFillOpacity(): number;

    /**
     * 获取描边不透明度
     * @returns {number} 描边不透明度值
     */
    getStrokeOpacity(): number;

    /**
     * 设置绘制不透明度
     * @param {"fill" | "stroke"} type - 类型
     * @param {number} val - 不透明度值
     * @param {boolean} [preventUndo] - 是否阻止撤销
     */
    setPaintOpacity(type: "fill" | "stroke", val: number, preventUndo?: boolean): void;

    /**
     * 获取绘制不透明度
     * @param {"fill" | "stroke"} type - 类型
     * @returns {number} 不透明度值
     */
    getPaintOpacity(type: "fill" | "stroke"): number;

    /**
     * 获取当前文档标题
     * @returns {string} 文档标题或空字符串
     */
    getDocumentTitle(): string;

    /**
     * 设置文档标题
     * @param {string} title - 新的文档标题
     */
    setDocumentTitle(title: string): void;

    /**
     * 获取偏移量
     * @returns {{ x: number; y: number }} 偏移量
     */
    getOffset(): { x: number; y: number };

    /**
     * 获取版本信息
     * @returns {string} 版本号
     */
    getVersion(): string;

    /**
     * 获取网格对齐设置
     * @returns {boolean} 是否启用网格对齐
     */
    getSnapToGrid(): boolean;

    /**
     * 获取开始变换时的变换值
     * @returns {string | null} 变换值
     */
    getStartTransform(): string | null;

    /**
     * 设置开始变换时的变换值
     * @param {string | null} transform - 变换值
     */
    setStartTransform(transform: string | null): void;

    // 清除和重置
    clear(): void;

    clearSvgContentElement(): void;

    // 扩展支持
    /**
     * 添加扩展
     * @param {string} name - 扩展名称
     * @param {Function} extInitFunc - 扩展初始化函数
     * @param {{ importLocale: Function }} initArgs - 初始化参数
     * @returns {Promise<any>} 扩展初始化结果
     */
    addExtension(
      name: string,
      extInitFunc: Function,
      initArgs: { importLocale: Function }
    ): Promise<any>;

    /**
     * 获取所有扩展
     * @returns {Record<string, any>} 扩展映射
     */
    getExtensions(): Record<string, any>;

    // 其他属性和方法
    getRubberBox(): SVGRectElement | null;

    setRubberBox(rb: SVGRectElement | null): SVGRectElement | null;

    /**
     * 设置好的图像 URL
     * @param {string} val - 图像 URL
     */
    setGoodImage(val: string): void;

    getLastGoodImgUrl(): string;

    flashStorage(): void;

    /**
     * 清理 SVG 内容
     * @param {Element} node - 要清理的节点
     */
    sanitizeSvg(node: Element): void;

    // Path 操作
    smoothControlPoints(): void;

    /**
     * 获取当前绘制的路径
     * @returns {SVGPathElement | null} 路径元素
     */
    getDrawnPath(): SVGPathElement | null;

    /**
     * 设置当前绘制的路径
     * @param {SVGPathElement | null} dp - 路径元素
     * @returns {SVGPathElement | null} 设置的路径元素
     */
    setDrawnPath(dp: SVGPathElement | null): SVGPathElement | null;

    // 其他状态和标志
    getStarted(): boolean;

    setStarted(s: boolean): void;

    /**
     * 获取当前输入模式
     * @returns {string} 当前模式名称
     */
    getCurrentMode(): string;

    /**
     * 设置当前输入模式
     * @param {string} cm - 模式名称
     * @returns {string} 设置的模式名称
     */
    setCurrentMode(cm: string): string;

    getCurrentResizeMode(): string;

    setCurrentResizeMode(value: string): void;

    getCurCommand(): any;

    setCurCommand(value: any): void;

    getFilter(): SVGFilterElement | null;

    setFilter(value: SVGFilterElement | null): void;

    getFilterHidden(): boolean;

    setFilterHidden(value: boolean): void;

    getContentW(): number;

    getContentH(): number;

    // 公开的属性
    /**
     * 文本操作工具,提供文本编辑相关功能
     */
    textActions: TextActions;
    /**
     * 撤销管理器,处理撤销/重做操作
     */
    undoMgr: UndoManager;
    /**
     * 当前画布配置选项
     */
    curConfig: SvgCanvasConfig;
    /**
     * 历史记录对象
     */
    history: any;
    /**
     * XML 命名空间映射
     */
    NS: Record<string, string>;
    /**
     * 选择器管理器,处理元素选择
     */
    selectorManager: SelectorManager;
    /**
     * 画布内容宽度
     */
    contentW: string | number;
    /**
     * 画布内容高度
     */
    contentH: string | number;
    /**
     * 当前编辑模式
     */
    currentMode: string;
    /**
     * 当前选中的组
     */
    currentGroup: SVGGElement | null;
    /**
     * 当前调整大小模式
     */
    currentResizeMode: string;
    /**
     * 当前命令
     */
    curCommand: any;
    /**
     * 当前应用的滤镜
     */
    filter: SVGFilterElement | null;
    /**
     * 滤镜是否隐藏
     */
    filterHidden: boolean;
    /**
     * 当前缩放比例
     */
    zoom: number;
    /**
     * 编辑器是否已启动
     */
    started: boolean;
    /**
     * 开始变换时的变换值
     */
    startTransform: string | null;
    /**
     * 选择框元素
     */
    rubberBox: SVGRectElement | null;
    /**
     * 最后一个有效的图片 URL
     */
    lastGoodImgUrl: string;
    /**
     * SVG 内容元素
     */
    svgContent: SVGSVGElement;
    /**
     * SVG 根元素
     */
    svgroot: SVGSVGElement;
    /**
     * 当前选中的元素数组
     */
    selectedElements: Element[];
    /**
     * 事件处理器映射
     */
    events: { changed: Function };
    /**
     * 已加载的扩展
     */
    extensions: Record<string, any>;
    /**
     * 当前绘制的路径
     */
    drawnPath: SVGPathElement | null;
    /**
     * 导入元素的 ID 映射
     */
    importIds: Record<string, any>;
    /**
     * 已删除元素的映射
     */
    removedElements: Record<string, any>;
    /**
     * 元素 ID 前缀
     */
    idprefix: string;

    // 新增的实例方法
    getBaseUnit(): string; // 获取基本单位
    getSnappingStep(): number; // 获取对齐步长
    getGridSnapping(): boolean; // 获取网格对齐状态
    getClipboardID(): string; // 获取剪贴板ID
    getDataStorage(): any; // 获取数据存储
    getDrawing(): any; // 获取绘图对象
    getVisElems(): Element[]; // 获取可见元素
    getrefAttrs(): string[]; // 获取引用属性
    getStepCount(): number; // 获取步数
    getThreSholdDist(): number; // 获取阈值距离
    initializeSvgCanvasMethods(): void; // 初始化SVG画布方法
    modeChangeEvent(): void; // 模式改变事件
    endChanges(options: { cmd: any; elem: Element }): void; // 结束更改
    changeSvgContent(): void; // 更改SVG内容
    getCanvas(): any; // 获取画布
    setCanvas(key: string, value: any): void; // 设置画布
    getParameter(): any; // 获取参数
    setParameter(value: any): void; // 设置参数
    getNextParameter(): any; // 获取下一个参数
    setNextParameter(value: any): void; // 设置下一个参数
    getRemovedElements(): Record<string, any>; // 获取已移除元素
    setRemovedElements(key: string, value: any): void; // 设置已移除元素
    getSelector(): any; // 获取选择器
    gettingSelectorManager(): SelectorManager; // 获取选择器管理器

    /**
     * 检查选中的文本元素是否为粗体
     * @returns {boolean} 如果所有选中的元素都是粗体则返回 true,否则返回 false
     */
    getBold(): boolean;

    /**
     * 将选中的元素设置为粗体或正常字重
     * @param {boolean} b - 指示粗体(true)或正常(false)
     */
    setBold(b: boolean): void;

    /**
     * 检查选中的文本元素是否为斜体
     * @returns {boolean} 如果所有选中的元素都是斜体则返回 true,否则返回 false
     */
    getItalic(): boolean;

    /**
     * 将选中的元素设置为斜体或正常样式
     * @param {boolean} i - 指示斜体(true)或正常(false)
     */
    setItalic(i: boolean): void;

    /**
     * 检查选中的文本元素是否具有指定的文本装饰
     * @param {string} value - 要检查的文本装饰值
     * @returns {boolean} 如果所有选中的元素都具有该文本装饰则返回 true
     */
    hasTextDecoration(value: string): boolean;

    /**
     * 为选中的文本元素添加文本装饰
     * @param {string} value - 要添加的文本装饰值
     */
    addTextDecoration(value: string): void;

    /**
     * 移除选中文本元素的文本装饰
     * @param {string} value - 要移除的文本装饰值
     */
    removeTextDecoration(value: string): void;

    /**
     * 设置文本锚点
     * @param {string} value - 文本锚点值(start、middle 或 end)
     */
    setTextAnchor(value: string): void;

    /**
     * 设置字母间距
     * @param {string} value - 字母间距值
     */
    setLetterSpacing(value: string): void;

    /**
     * 设置单词间距
     * @param {string} value - 单词间距值
     */
    setWordSpacing(value: string): void;

    /**
     * 设置文本长度
     * @param {string} value - 文本长度值
     */
    setTextLength(value: string): void;

    /**
     * 设置长度调整方式
     * @param {string} value - 长度调整值
     */
    setLengthAdjust(value: string): void;

    /**
     * 获取当前字体族
     * @returns {string} 当前字体族
     */
    getFontFamily(): string;

    /**
     * 设置新的字体族
     * @param {string} val - 新的字体族字符串
     */
    setFontFamily(val: string): void;

    /**
     * 设置新的字体颜色
     * @param {string} val - 新的字体颜色字符串
     */
    setFontColor(val: string): void;

    /**
     * 获取当前字体颜色
     * @returns {string} 当前字体颜色
     */
    getFontColor(): string;

    /**
     * 获取当前字体大小
     * @returns {number} 当前字体大小
     */
    getFontSize(): number;

    /**
     * 为选中的元素应用给定的字体大小
     * @param {number} val - 新的字体大小
     */
    setFontSize(val: number): void;

    /**
     * 获取选中元素的当前文本内容
     * @returns {string} 选中元素的文本内容
     */
    getText(): string;

    /**
     * 使用给定的字符串更新文本元素
     * @param {string} val - 新的文本字符串
     */
    setTextContent(val: string): void;

    /**
     * 为选中的图像元素设置新的图像 URL
     * @param {string} val - 图像 URL/路径字符串
     */
    setImageURL(val: string): void;

    /**
     * 为选中的锚点元素设置新的链接 URL
     * @param {string} val - 链接 URL/路径字符串
     */
    setLinkURL(val: string): void;

    /**
     * 设置选中矩形元素的 rx 和 ry 值以改变其圆角半径
     * @param {string|number} val - 新的半径值
     */
    setRectRadius(val: string | number): void;

    /**
     * 将选中的元素包装在锚点元素中或将组转换为锚点元素
     * @param {string} url - 链接 URL
     */
    makeHyperlink(url: string): void;

    /**
     * 移除超链接
     */
    removeHyperlink(): void;

    /**
     * 设置选中线段的新线段类型
     * @param {number} newType - 新的线段类型
     */
    setSegType(newType: number): void;
  }

  /**
   * 文本操作接口,提供文本编辑相关的功能
   */
  interface TextActions {
    /**
     * 选择文本
     * @param {Element} target - 目标文本元素
     */
    select(target: Element): void;

    /**
     * 开始编辑文本
     * @param {Element} elem - 要编辑的文本元素
     */
    start(elem: Element): void;

    /**
     * 结束文本编辑
     */
    finish(): void;

    /**
     * 切换到选择模式
     * @param {Element} elem - 目标元素
     */
    toSelectMode(elem: Element): void;

    toEditMode(x: number, y: number): void;

    setInputElem(elem: Element): void;

    /**
     * 清除文本选择
     */
    clear(): void;

    /**
     * 鼠标按下事件处理函数
     */
    mouseDown: Function;

    /**
     * 鼠标移动事件处理函数
     */
    mouseMove: Function;

    /**
     * 鼠标抬起事件处理函数
     */
    mouseUp: Function;
  }

  /**
   * 路径操作接口,提供路径编辑相关的功能
   */
  interface PathActions {
    /**
     * 鼠标按下事件处理函数
     */
    mouseDown: Function;

    /**
     * 鼠标移动事件处理函数
     */
    mouseMove: Function;

    /**
     * 鼠标抬起事件处理函数
     */
    mouseUp: Function;

    /**
     * 切换到编辑模式
     */
    toEditMode: Function;

    /**
     * 切换到选择模式
     */
    toSelectMode: Function;

    /**
     * 添加子路径
     */
    addSubPath: Function;

    /**
     * 清除路径
     */
    clear: Function;

    /**
     * 重置路径数据
     */
    resetD: Function;

    /**
     * 插入线段
     */
    insertSeg: Function;

    /**
     * 添加线段
     */
    addSeg: Function;

    /**
     * 添加点
     */
    addPoints: Function;

    /**
     * 清除数据
     */
    clearData: Function;

    /**
     * 是否可以删除节点
     */
    canDeleteNodes: boolean;

    /**
     * 是否链接控制点
     */
    linkControlPoints: boolean;

    /**
     * 移动节点
     * @param {string} attr - 属性名
     * @param {string | number} newValue - 新值
     */
    moveNode: (attr: string, newValue: string | number) => void;

    /**
     * 平滑控制点
     */
    smoothControlPoints: () => void;

    /**
     * 删除选中的节点
     */
    deleteSelectedNodes: () => void;

    /**
     * 选择节点
     * @param {SVGPathSegment} target - 目标路径段
     */
    selectNode: (target: any) => void;
  }

  /**
   * 选择器管理器接口,管理元素的选择状态
   */
  interface SelectorManager {
    /**
     * 选择器父组元素
     */
    selectorParentGroup: SVGGElement;

    /**
     * 橡皮筋选框元素
     */
    rubberBandBox: SVGRectElement;

    /**
     * 选择器数组
     */
    selectors: any[];

    /**
     * 选择器映射
     */
    selectorMap: Record<string, any>;

    /**
     * 选择器手柄
     */
    selectorGrips: Record<string, any>;

    /**
     * 请求选择器
     * @param {Element} elem - 目标元素
     * @returns {Selector} 选择器实例
     */
    requestSelector(elem: Element): Selector;

    /**
     * 释放选择器
     * @param {Element} elem - 目标元素
     */
    releaseSelector(elem: Element): void;

    /**
     * 获取橡皮筋选框
     * @returns {SVGRectElement} 选框元素
     */
    getRubberBandBox(): SVGRectElement;

    /**
     * 初始化组
     */
    initGroup(): void;
  }

  /**
   * 选择器接口,处理单个元素的选择状态
   */
  interface Selector {
    /**
     * 显示/隐藏控制点
     * @param {boolean} show - 是否显示
     */
    showGrips(show: boolean): void;

    /**
     * 调整选择器大小
     */
    resize(): void;
  }

  /**
   * 撤销管理器接口,处理撤销/重做操作
   */
  interface UndoManager {
    /**
     * 处理器映射
     */
    handler_: Record<string, any>;

    /**
     * 撤销栈指针
     */
    undoStackPointer: number;

    /**
     * 撤销栈
     */
    undoStack: any[];

    /**
     * 撤销更改栈指针
     */
    undoChangeStackPointer: number;

    /**
     * 可撤销更改栈
     */
    undoableChangeStack: any[];

    /**
     * 添加命令到历史记录
     * @param {any} cmd - 命令对象
     */
    addCommandToHistory(cmd: any): void;

    /**
     * 执行撤销操作
     */
    undo(): void;

    /**
     * 执行重做操作
     */
    redo(): void;

    /**
     * 重置撤销栈
     */
    resetUndoStack(): void;
  }

  export default SvgCanvas;
}
