/**
 * ISC License
 *
 * Copyright (c) 2018, Andrea Giammarchi, @WebReflection
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */
class QueryResult extends Array {}
const {create, defineProperty} = Object;
const AP = Array.prototype;
const DOM_CONTENT_LOADED = 'DOMContentLoaded';
const LOAD = 'load';
const NO_TRANSPILER_ISSUES = (new QueryResult) instanceof QueryResult;
const QRP = QueryResult.prototype;
// fixes methods returning non QueryResult
/* istanbul ignore if */
if (!NO_TRANSPILER_ISSUES)
  Object.getOwnPropertyNames(AP).forEach(name => {
    const desc = Object.getOwnPropertyDescriptor(AP, name);
    if (typeof desc.value === 'function') {
      const fn = desc.value;
      desc.value = function () {
        const result = fn.apply(this, arguments);
        return result instanceof Array ? patch(result) : result;
      };
    }
    defineProperty(QRP, name, desc);
  });
// fixes badly transpiled classes
const patch = NO_TRANSPILER_ISSUES ?
  qr => qr :
  /* istanbul ignore next */
  qr => {
    const nqr = create(QRP);
    push.apply(nqr, slice(qr));
    return nqr;
  };
const push = AP.push;
const search = (list, el) => {
  const nodes = [];
  const length = list.length;
  for (let i = 0; i < length; i++) {
    const css = list[i].trim();
    if (css.slice(-6) === ':first') {
      const node = el.querySelector(css.slice(0, -6));
      if (node) push.call(nodes, node);
    } else
      push.apply(nodes, slice(el.querySelectorAll(css)));
  }
  return new QueryResult(...nodes);
};
const slice = NO_TRANSPILER_ISSUES ?
  patch :
  /* istanbul ignore next */
  all => {
    // do not use slice.call(...) due old IE gotcha
    const nodes = [];
    const length = all.length;
    for (let i = 0; i < length; i++)
      nodes[i] = all[i];
    return nodes;
  }
// use function to avoid usage of Symbol.hasInstance
// (broken in older browsers anyway)
const $ = function $(CSS, parent = document) {
  switch (typeof CSS) {
    case 'string': return patch(search(CSS.split(','), parent));
    case 'object':
      // needed to avoid iterator dance (breaks in older IEs)
      const nodes = [];
      const all = ('nodeType' in CSS || 'postMessage' in CSS) ? [CSS] : CSS;
      push.apply(nodes, slice(all));
      return patch(new QueryResult(...nodes));
    case 'function':
      const $parent = $(parent);
      const $window = $(parent.defaultView);
      const handler = {handleEvent(event) {
        $parent.off(DOM_CONTENT_LOADED, handler);
        $window.off(LOAD, handler);
        CSS(event);
      }};
      $parent.on(DOM_CONTENT_LOADED, handler);
      $window.on(LOAD, handler);
      const rs = parent.readyState;
      if (rs == 'complete' || (rs != 'loading' && !parent.documentElement.doScroll))
        setTimeout(() => $parent.dispatch(DOM_CONTENT_LOADED));
      return $;
  }
};
$.prototype = QRP;
$.extend = (key, value) =>
            (defineProperty(QRP, key, {configurable: true, value}), $);
// dropped usage of for-of to avoid broken iteration dance in older IEs
$.extend('dispatch', function dispatch(type, init = {}) {
  const event = new CustomEvent(type, init);
  const length = this.length;
  for (let i = 0; i < length; i++)
    this[i].dispatchEvent(event);
  return this;
})
.extend('off', function off(type, handler, options = false) {
  const length = this.length;
  for (let i = 0; i < length; i++)
    this[i].removeEventListener(type, handler, options);
  return this;
})
.extend('on', function on(type, handler, options = false) {
  const length = this.length;
  for (let i = 0; i < length; i++)
    this[i].addEventListener(type, handler, options);
  return this;
});

export default $;
