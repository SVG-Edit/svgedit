// From https://github.com/inexorabletash/polyfill/blob/master/dom.js

/**
 * @module DOMPolyfill
 */

/**
 *
 * @param {Node} o
 * @param {module:DOMPolyfill~ParentNode|module:DOMPolyfill~ChildNode} ps
 * @returns {void}
 */
function mixin (o, ps) {
  if (!o) return;
  Object.keys(ps).forEach((p) => {
    if ((p in o) || (p in o.prototype)) { return; }
    try {
      Object.defineProperty(
        o.prototype,
        p,
        Object.getOwnPropertyDescriptor(ps, p)
      );
    } catch (ex) {
      // Throws in IE8; just copy it
      o[p] = ps[p];
    }
  });
}

/**
 *
 * @param {Node[]} nodes
 * @returns {Node}
 */
function convertNodesIntoANode (nodes) {
  nodes = nodes.map((node) => {
    const isNode = node && typeof node === 'object' && 'nodeType' in node;
    return isNode ? node : document.createTextNode(node);
  });
  if (nodes.length === 1) {
    return nodes[0];
  }
  const node = document.createDocumentFragment();
  nodes.forEach((n) => {
    node.appendChild(n);
  });
  return node;
}

const ParentNode = {
  prepend (...nodes) {
    nodes = convertNodesIntoANode(nodes);
    this.insertBefore(nodes, this.firstChild);
  },
  append (...nodes) {
    nodes = convertNodesIntoANode(nodes);
    this.appendChild(nodes);
  }
};

mixin(Document || HTMLDocument, ParentNode); // HTMLDocument for IE8
mixin(DocumentFragment, ParentNode);
mixin(Element, ParentNode);

// Mixin ChildNode
// https://dom.spec.whatwg.org/#interface-childnode

const ChildNode = {
  before (...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    let viablePreviousSibling = this.previousSibling;
    while (nodes.includes(viablePreviousSibling)) {
      viablePreviousSibling = viablePreviousSibling.previousSibling;
    }
    const node = convertNodesIntoANode(nodes);
    parent.insertBefore(
      node,
      viablePreviousSibling
        ? viablePreviousSibling.nextSibling
        : parent.firstChild
    );
  },
  after (...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    let viableNextSibling = this.nextSibling;
    while (nodes.includes(viableNextSibling)) {
      viableNextSibling = viableNextSibling.nextSibling;
    }
    const node = convertNodesIntoANode(nodes);
    // eslint-disable-next-line unicorn/prefer-modern-dom-apis
    parent.insertBefore(node, viableNextSibling);
  },
  replaceWith (...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    let viableNextSibling = this.nextSibling;
    while (nodes.includes(viableNextSibling)) {
      viableNextSibling = viableNextSibling.nextSibling;
    }
    const node = convertNodesIntoANode(nodes);

    if (this.parentNode === parent) {
      parent.replaceChild(node, this);
    } else {
      // eslint-disable-next-line unicorn/prefer-modern-dom-apis
      parent.insertBefore(node, viableNextSibling);
    }
  },
  remove () {
    if (!this.parentNode) { return; }
    this.parentNode.removeChild(this); // eslint-disable-line unicorn/prefer-node-remove
  }
};

mixin(DocumentType, ChildNode);
mixin(Element, ChildNode);
mixin(CharacterData, ChildNode);
