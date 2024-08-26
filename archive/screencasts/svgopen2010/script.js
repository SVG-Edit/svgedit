(() => {
const doc = document;
const disableBuilds = true;

let ctr = 0;

const byId = function (id) {
  if (typeof id === 'string') { return doc.getElementById(id); }
  return id;
};

const query = function (qry, root) {
  if (!qry) { return []; }
  if (typeof qry !== 'string') { return [...qry]; }
  if (typeof root === 'string') {
    root = byId(root);
    if (!root) { return []; }
  }

  root = root || document;
  const rootIsDoc = (root.nodeType === 9);
  const dcmnt = rootIsDoc ? root : (root.ownerDocument || document);

  // rewrite the query to be ID rooted
  if (!rootIsDoc || ('>~+'.includes(qry[0]))) {
    root.id = root.id || ('qUnique' + (ctr++));
    qry = '#' + root.id + ' ' + qry;
  }
  // don't choke on something like ".yada.yada >"
  if ('>~+'.includes(qry.slice(-1))) { qry += ' *'; }

  return [...dcmnt.querySelectorAll(qry)];
};

const ua = navigator.userAgent;
const isFF = Number.parseFloat(ua.split('Firefox/')[1]) || undefined;
const isWK = Number.parseFloat(ua.split('WebKit/')[1]) || undefined;
const isOpera = Number.parseFloat(ua.split('Opera/')[1]) || undefined;

const canTransition = (function () {
  const ver = Number.parseFloat(ua.split('Version/')[1]) || undefined;
  // test to determine if this browser can handle CSS transitions.
  const cachedCanTransition =
    (isWK || (isFF && isFF > 3.6) || (isOpera && ver >= 10.5));
  return function () { return cachedCanTransition; };
})();

//
// Slide class
//
const Slide = function (node, idx) {
  this._node = node;
  if (idx >= 0) {
    this._count = idx + 1;
  }
  if (this._node) {
    this._node.classList.add('slide', 'distant-slide');
  }
  this._makeCounter();
  this._makeBuildList();
};

Slide.prototype = {
  _node: null,
  _count: 0,
  _buildList: [],
  _visited: false,
  _currentState: '',
  _states: [
    'distant-slide', 'far-past',
    'past', 'current', 'future',
    'far-future', 'distant-slide'
  ],
  setState (state) {
    if (typeof state !== 'string') {
      state = this._states[state];
    }
    if (state === 'current' && !this._visited) {
      this._visited = true;
      this._makeBuildList();
    }
    this._node.classList.remove(...this._states);
    this._node.classList.add(state);
    this._currentState = state;

    // delay first auto run. Really wish this were in CSS.
    /*
    this._runAutos();
    */
    const that = this;
    setTimeout(function () { that._runAutos(); }, 400);
  },
  _makeCounter () {
    if (!this._count || !this._node) { return; }
    const c = doc.createElement('span');
    c.textContent = this._count;
    c.className = 'counter';
    this._node.append(c);
  },
  _makeBuildList () {
    this._buildList = [];
    if (disableBuilds) { return; }
    if (this._node) {
      this._buildList = query('[data-build] > *', this._node);
    }
    this._buildList.forEach(function (el) {
      el.classList.add('to-build');
    });
  },
  _runAutos () {
    if (this._currentState !== 'current') {
      return;
    }
    // find the next auto, slice it out of the list, and run it
    let idx = -1;
    this._buildList.some(function (n, i) {
      if (n.hasAttribute('data-auto')) {
        idx = i;
        return true;
      }
      return false;
    });
    if (idx >= 0) {
      const elem = this._buildList.splice(idx, 1)[0];
      const transitionEnd = isWK ? 'webkitTransitionEnd' : (isFF ? 'mozTransitionEnd' : 'oTransitionEnd');
      const that = this;
      if (canTransition()) {
        const l = function (evt) {
          elem.parentNode.removeEventListener(transitionEnd, l);
          that._runAutos();
        };
        elem.parentNode.addEventListener(transitionEnd, l);
        elem.classList.remove('to-build');
      } else {
        setTimeout(function () {
          elem.classList.remove('to-build');
          that._runAutos();
        }, 400);
      }
    }
  },
  buildNext () {
    if (!this._buildList.length) {
      return false;
    }
    this._buildList.shift().classList.remove('to-build');
    return true;
  }
};

//
// SlideShow class
//
const SlideShow = function (slides) {
  this._slides = (slides || []).map(function (el, idx) {
    return new Slide(el, idx);
  });

  const h = window.location.hash;
  try {
    this.current = Number.parseInt(h.split('#slide')[1]);
  } catch (e) { /* squelch */ }
  this.current = Number.isNaN(this.current) ? 1 : this.current;
  const that = this;
  doc.addEventListener('keydown',
    function (e) { that.handleKeys(e); });
  doc.addEventListener('mousewheel',
    function (e) { that.handleWheel(e); });
  doc.addEventListener('DOMMouseScroll',
    function (e) { that.handleWheel(e); });
  doc.addEventListener('touchstart',
    function (e) { that.handleTouchStart(e); });
  doc.addEventListener('touchend',
    function (e) { that.handleTouchEnd(e); });
  window.addEventListener('popstate',
    function (e) { that.go(e.state); });
  this._update();
};

SlideShow.prototype = {
  _slides: [],
  _update (dontPush) {
    document.querySelector('#presentation-counter').textContent = this.current;
    if (history.pushState) {
      if (!dontPush) {
        history.pushState(this.current, 'Slide ' + this.current, '#slide' + this.current);
      }
    } else {
      window.location.hash = 'slide' + this.current;
    }
    for (let x = this.current - 1; x < this.current + 7; x++) {
      if (this._slides[x - 4]) {
        this._slides[x - 4].setState(Math.max(0, x - this.current));
      }
    }
  },

  current: 0,
  next () {
    if (!this._slides[this.current - 1].buildNext()) {
      this.current = Math.min(this.current + 1, this._slides.length);
      this._update();
    }
  },
  prev () {
    this.current = Math.max(this.current - 1, 1);
    this._update();
  },
  go (num) {
    if (history.pushState && this.current !== num) {
      history.replaceState(this.current, 'Slide ' + this.current, '#slide' + this.current);
    }
    this.current = num;
    this._update(true);
  },

  _notesOn: false,
  showNotes () {
    const notesOn = this._notesOn = !this._notesOn;
    query('.notes').forEach(function (el) {
      el.style.display = (notesOn) ? 'block' : 'none';
    });
  },
  switch3D () {
    document.body.classList.toggle('three-d');
  },
  handleWheel (e) {
    let delta = 0;
    if (e.wheelDelta) {
      delta = e.wheelDelta / 120;
      if (isOpera) {
        delta = -delta;
      }
    } else if (e.detail) {
      delta = -e.detail / 3;
    }

    if (delta > 0) {
      this.prev();
      return;
    }
    if (delta < 0) {
      this.next();
    }
  },
  handleKeys (e) {
    if ((/^(?:input|textarea)$/i).test(e.target.nodeName)) return;

    switch (e.keyCode) {
    case 37: // left arrow
      this.prev(); break;
    case 39: // right arrow
    case 32: // space
      this.next(); break;
    case 50: // 2
      this.showNotes(); break;
    case 51: // 3
      this.switch3D(); break;
    }
  },
  _touchStartX: 0,
  handleTouchStart (e) {
    this._touchStartX = e.touches[0].pageX;
  },
  handleTouchEnd (e) {
    const delta = this._touchStartX - e.changedTouches[0].pageX;
    const SWIPE_SIZE = 150;
    if (delta > SWIPE_SIZE) {
      this.next();
    } else if (delta < -SWIPE_SIZE) {
      this.prev();
    }
  }
};

// Initialize
/* const slideshow = */ new SlideShow(query('.slide')); // eslint-disable-line no-new

document.querySelector('#toggle-counter').addEventListener('click', toggleCounter);
document.querySelector('#toggle-size').addEventListener('click', toggleSize);
document.querySelector('#toggle-transitions').addEventListener('click', toggleTransitions);
document.querySelector('#toggle-gradients').addEventListener('click', toggleGradients);

const counters = document.querySelectorAll('.counter');
const slides = document.querySelectorAll('.slide');

/**
 * Show or hide the counters.
 * @returns {void}
 */
function toggleCounter () {
  [...counters].forEach(function (el) {
    el.style.display = (el.offsetHeight) ? 'none' : 'block';
  });
}

/**
 * Add or remove `reduced` (size) class.
 * @returns {void}
 */
function toggleSize () {
  [...slides].forEach(function (el) {
    if (!(/reduced/).test(el.className)) {
      el.classList.add('reduced');
    } else {
      el.classList.remove('reduced');
    }
  });
}

/**
 * Add or remove `no-transitions` class.
 * @returns {void}
 */
function toggleTransitions () {
  [...slides].forEach(function (el) {
    if (!(/no-transitions/).test(el.className)) {
      el.classList.add('no-transitions');
    } else {
      el.classList.remove('no-transitions');
    }
  });
}

/**
 * Add or remove `no-gradients` class.
 * @returns {void}
 */
function toggleGradients () {
  [...slides].forEach(function (el) {
    if (!(/no-gradients/).test(el.className)) {
      el.classList.add('no-gradients');
    } else {
      el.classList.remove('no-gradients');
    }
  });
}
})();
