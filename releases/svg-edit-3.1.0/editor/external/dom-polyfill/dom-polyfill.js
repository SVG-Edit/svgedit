// From https://github.com/inexorabletash/polyfill/blob/master/dom.js

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

function convertNodesIntoANode (nodes) {
  nodes = nodes.map((node) => {
    return !(node instanceof Node) ? document.createTextNode(node) : node;
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
      parent.insertBefore(node, viableNextSibling);
    }
  },
  remove () {
    if (!this.parentNode) { return; }
    this.parentNode.removeChild(this);
  }
};

mixin(DocumentType, ChildNode);
mixin(Element, ChildNode);
mixin(CharacterData, ChildNode);
