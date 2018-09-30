(function () {
  'use strict';

  // From https://github.com/inexorabletash/polyfill/blob/master/dom.js
  function mixin(o, ps) {
    if (!o) return;
    Object.keys(ps).forEach(function (p) {
      if (p in o || p in o.prototype) {
        return;
      }

      try {
        Object.defineProperty(o.prototype, p, Object.getOwnPropertyDescriptor(ps, p));
      } catch (ex) {
        // Throws in IE8; just copy it
        o[p] = ps[p];
      }
    });
  }

  function convertNodesIntoANode(nodes) {
    nodes = nodes.map(function (node) {
      return !(node instanceof Node) ? document.createTextNode(node) : node;
    });

    if (nodes.length === 1) {
      return nodes[0];
    }

    var node = document.createDocumentFragment();
    nodes.forEach(function (n) {
      node.appendChild(n);
    });
    return node;
  }

  var ParentNode = {
    prepend: function prepend() {
      for (var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++) {
        nodes[_key] = arguments[_key];
      }

      nodes = convertNodesIntoANode(nodes);
      this.insertBefore(nodes, this.firstChild);
    },
    append: function append() {
      for (var _len2 = arguments.length, nodes = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        nodes[_key2] = arguments[_key2];
      }

      nodes = convertNodesIntoANode(nodes);
      this.appendChild(nodes);
    }
  };
  mixin(Document || HTMLDocument, ParentNode); // HTMLDocument for IE8

  mixin(DocumentFragment, ParentNode);
  mixin(Element, ParentNode); // Mixin ChildNode
  // https://dom.spec.whatwg.org/#interface-childnode

  var ChildNode = {
    before: function before() {
      var parent = this.parentNode;
      if (!parent) return;
      var viablePreviousSibling = this.previousSibling;

      for (var _len3 = arguments.length, nodes = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        nodes[_key3] = arguments[_key3];
      }

      while (nodes.includes(viablePreviousSibling)) {
        viablePreviousSibling = viablePreviousSibling.previousSibling;
      }

      var node = convertNodesIntoANode(nodes);
      parent.insertBefore(node, viablePreviousSibling ? viablePreviousSibling.nextSibling : parent.firstChild);
    },
    after: function after() {
      var parent = this.parentNode;
      if (!parent) return;
      var viableNextSibling = this.nextSibling;

      for (var _len4 = arguments.length, nodes = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        nodes[_key4] = arguments[_key4];
      }

      while (nodes.includes(viableNextSibling)) {
        viableNextSibling = viableNextSibling.nextSibling;
      }

      var node = convertNodesIntoANode(nodes);
      parent.insertBefore(node, viableNextSibling);
    },
    replaceWith: function replaceWith() {
      var parent = this.parentNode;
      if (!parent) return;
      var viableNextSibling = this.nextSibling;

      for (var _len5 = arguments.length, nodes = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        nodes[_key5] = arguments[_key5];
      }

      while (nodes.includes(viableNextSibling)) {
        viableNextSibling = viableNextSibling.nextSibling;
      }

      var node = convertNodesIntoANode(nodes);

      if (this.parentNode === parent) {
        parent.replaceChild(node, this);
      } else {
        parent.insertBefore(node, viableNextSibling);
      }
    },
    remove: function remove() {
      if (!this.parentNode) {
        return;
      }

      this.parentNode.removeChild(this);
    }
  };
  mixin(DocumentType, ChildNode);
  mixin(Element, ChildNode);
  mixin(CharacterData, ChildNode);

}());
