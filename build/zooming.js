(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Zooming = factory());
}(this, (function () { 'use strict';

/* eslint-disable */
/*
 * classList.js: Cross-browser full element.classList implementation.
 * 1.1.20170112
 *
 * By Eli Grey, http://eligrey.com
 * License: Dedicated to the public domain.
 *   See https://github.com/eligrey/classList.js/blob/master/LICENSE.md
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js */

if ("document" in self) {

	// Full polyfill for browsers with no classList support
	// Including IE < Edge missing SVGElement.classList
	if (!("classList" in document.createElement("_")) || document.createElementNS && !("classList" in document.createElementNS("http://www.w3.org/2000/svg", "g"))) {

		(function (view) {

			"use strict";

			if (!('Element' in view)) return;

			var classListProp = "classList",
			    protoProp = "prototype",
			    elemCtrProto = view.Element[protoProp],
			    objCtr = Object,
			    strTrim = String[protoProp].trim || function () {
				return this.replace(/^\s+|\s+$/g, "");
			},
			    arrIndexOf = Array[protoProp].indexOf || function (item) {
				var i = 0,
				    len = this.length;
				for (; i < len; i++) {
					if (i in this && this[i] === item) {
						return i;
					}
				}
				return -1;
			}
			// Vendors: please allow content code to instantiate DOMExceptions
			,
			    DOMEx = function DOMEx(type, message) {
				this.name = type;
				this.code = DOMException[type];
				this.message = message;
			},
			    checkTokenAndGetIndex = function checkTokenAndGetIndex(classList, token) {
				if (token === "") {
					throw new DOMEx("SYNTAX_ERR", "An invalid or illegal string was specified");
				}
				if (/\s/.test(token)) {
					throw new DOMEx("INVALID_CHARACTER_ERR", "String contains an invalid character");
				}
				return arrIndexOf.call(classList, token);
			},
			    ClassList = function ClassList(elem) {
				var trimmedClasses = strTrim.call(elem.getAttribute("class") || ""),
				    classes = trimmedClasses ? trimmedClasses.split(/\s+/) : [],
				    i = 0,
				    len = classes.length;
				for (; i < len; i++) {
					this.push(classes[i]);
				}
				this._updateClassName = function () {
					elem.setAttribute("class", this.toString());
				};
			},
			    classListProto = ClassList[protoProp] = [],
			    classListGetter = function classListGetter() {
				return new ClassList(this);
			};
			// Most DOMException implementations don't allow calling DOMException's toString()
			// on non-DOMExceptions. Error's toString() is sufficient here.
			DOMEx[protoProp] = Error[protoProp];
			classListProto.item = function (i) {
				return this[i] || null;
			};
			classListProto.contains = function (token) {
				token += "";
				return checkTokenAndGetIndex(this, token) !== -1;
			};
			classListProto.add = function () {
				var tokens = arguments,
				    i = 0,
				    l = tokens.length,
				    token,
				    updated = false;
				do {
					token = tokens[i] + "";
					if (checkTokenAndGetIndex(this, token) === -1) {
						this.push(token);
						updated = true;
					}
				} while (++i < l);

				if (updated) {
					this._updateClassName();
				}
			};
			classListProto.remove = function () {
				var tokens = arguments,
				    i = 0,
				    l = tokens.length,
				    token,
				    updated = false,
				    index;
				do {
					token = tokens[i] + "";
					index = checkTokenAndGetIndex(this, token);
					while (index !== -1) {
						this.splice(index, 1);
						updated = true;
						index = checkTokenAndGetIndex(this, token);
					}
				} while (++i < l);

				if (updated) {
					this._updateClassName();
				}
			};
			classListProto.toggle = function (token, force) {
				token += "";

				var result = this.contains(token),
				    method = result ? force !== true && "remove" : force !== false && "add";

				if (method) {
					this[method](token);
				}

				if (force === true || force === false) {
					return force;
				} else {
					return !result;
				}
			};
			classListProto.toString = function () {
				return this.join(" ");
			};

			if (objCtr.defineProperty) {
				var classListPropDesc = {
					get: classListGetter,
					enumerable: true,
					configurable: true
				};
				try {
					objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
				} catch (ex) {
					// IE 8 doesn't support enumerable:true
					// adding undefined to fight this issue https://github.com/eligrey/classList.js/issues/36
					// modernie IE8-MSW7 machine has IE8 8.0.6001.18702 and is affected
					if (ex.number === undefined || ex.number === -0x7FF5EC54) {
						classListPropDesc.enumerable = false;
						objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
					}
				}
			} else if (objCtr[protoProp].__defineGetter__) {
				elemCtrProto.__defineGetter__(classListProp, classListGetter);
			}
		})(self);
	} else {
		// There is full or partial native classList support, so just check if we need
		// to normalize the add/remove and toggle APIs.

		(function () {
			"use strict";

			var testElement = document.createElement("_");

			testElement.classList.add("c1", "c2");

			// Polyfill for IE 10/11 and Firefox <26, where classList.add and
			// classList.remove exist but support only one argument at a time.
			if (!testElement.classList.contains("c2")) {
				var createMethod = function createMethod(method) {
					var original = DOMTokenList.prototype[method];

					DOMTokenList.prototype[method] = function (token) {
						var i,
						    len = arguments.length;

						for (i = 0; i < len; i++) {
							token = arguments[i];
							original.call(this, token);
						}
					};
				};
				createMethod('add');
				createMethod('remove');
			}

			testElement.classList.toggle("c3", false);

			// Polyfill for IE 10 and Firefox <24, where classList.toggle does not
			// support the second argument.
			if (testElement.classList.contains("c3")) {
				var _toggle = DOMTokenList.prototype.toggle;

				DOMTokenList.prototype.toggle = function (token, force) {
					if (1 in arguments && !this.contains(token) === !force) {
						return force;
					} else {
						return _toggle.call(this, token);
					}
				};
			}

			testElement = null;
		})();
	}
}

/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

Object.assign = function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var body$1 = document.body;
var docElm = document.documentElement;
var webkitPrefix = 'WebkitAppearance' in document.documentElement.style ? '-webkit-' : '';

function on(elSelector, eventName, selector, handler, useCapture) {
  var _useCapture = useCapture === undefined ? false : useCapture;
  var elements = null;
  if (typeof elSelector === 'string') {
    elements = document.querySelectorAll(elSelector);
  } else {
    elements = [].concat(elSelector);
  }
  var addEventListener = function addEventListener(element) {
    element.addEventListener(eventName, function (e) {
      for (var target = e.target; target && target !== this; target = target.parentNode) {
        // loop parent nodes from the target to the delegation node
        var match = false;
        if (target.matches) {
          match = target.matches(selector);
        } else if (target.webkitMatchesSelector) {
          match = target.webkitMatchesSelector(selector);
        } else if (target.mozMatchesSelector) {
          match = target.mozMatchesSelector(selector);
        } else if (target.msMatchesSelector) {
          match = target.msMatchesSelector(selector);
        } else if (target.oMatchesSelector) {
          match = target.oMatchesSelector(selector);
        }
        if (match) {
          handler.call(target, e);
          break;
        }
      }
    }, _useCapture);
  };
  Array.prototype.forEach.call(elements, addEventListener);
}

var divide = function divide(denominator) {
  return function (numerator) {
    return numerator / denominator;
  };
};

var half = divide(2);

var loadImage = function loadImage(url, cb) {
  var img = new Image();
  img.onload = function () {
    if (cb) cb(img);
  };
  img.src = url;
};

var scrollTop = function scrollTop() {
  return window.pageYOffset || (docElm || body$1.parentNode || body$1).scrollTop;
};

var getWindowCenter = function getWindowCenter() {
  var docWidth = docElm.clientWidth || body$1.clientWidth;
  var docHeight = docElm.clientHeight || body$1.clientHeight;

  return {
    x: half(docWidth),
    y: half(docHeight)
  };
};

var toggleListeners = function toggleListeners(el, types, handler) {
  var add = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  types.forEach(function (t) {
    if (add) {
      el.addEventListener(t, handler[t]);
    } else {
      el.removeEventListener(t, handler[t]);
    }
  });
};

var detectIE = function detectIE() {
  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';

  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';

  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';

  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  var edge = ua.indexOf('Edge/');
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
  }

  // other browser
  return false;
};

/**
 * A list of options.
 *
 * @type {Object}
 * @example
 * // Default options
 * var options = {
 *   defaultZoomable: 'img[data-action="zoom"]',
 *   enableGrab: true,
 *   preloadImage: true,
 *   transitionDuration: 0.4,
 *   transitionTimingFunction: 'cubic-bezier(0.4, 0, 0, 1)',
 *   bgColor: 'rgb(255, 255, 255)',
 *   bgOpacity: 1,
 *   scaleBase: 1.0,
 *   scaleExtra: 0.5,
 *   scrollThreshold: 40,
 *   onOpen: null,
 *   onClose: null,
 *   onRelease: null,
 *   onBeforeOpen: null,
 *   onBeforeClose: null,
 *   onBeforeGrab: null,
 *   onBeforeMove: null,
 *   onBeforeRelease: null
 * }
 */
var options = {
  /**
   * Zoomable elements by default. It can be a css selector or an element.
   * @type {string|Element}
   */
  defaultZoomable: 'img[data-action="zoom"]',

  /**
   * To be able to grab and drag the image for extra zoom-in.
   * @type {boolean}
   */
  enableGrab: true,

  /**
   * Preload images with attribute "data-original".
   * @type {boolean}
   */
  preloadImage: true,

  /**
   * Transition duration in seconds.
   * @type {number}
   */
  transitionDuration: 0.4,

  /**
   * Transition timing function.
   * @type {string}
   */
  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0, 1)',

  /**
   * Overlay background color.
   * @type {string}
   */
  bgColor: 'rgb(255, 255, 255)',

  /**
   * Overlay background opacity.
   * @type {number}
   */
  bgOpacity: 1,

  /**
   * The base scale factor for zooming. By default scale to fit the window.
   * @type {number}
   */
  scaleBase: 1.0,

  /**
   * The extra scale factor when grabbing the image.
   * @type {number}
   */
  scaleExtra: 0.5,

  /**
   * How much scrolling it takes before closing out.
   * @type {number}
   */
  scrollThreshold: 40,

  /**
   * A callback function that will be called when a target is opened and
   * transition has ended. It will get the target element as the argument.
   * @type {Function}
   */
  onOpen: null,

  /**
   * Same as above, except fired when closed.
   * @type {Function}
   */
  onClose: null,

  /**
   * Same as above, except fired when released.
   * @type {Function}
   */
  onRelease: null,

  /**
   * A callback function that will be called before open.
   * @type {Function}
   */
  onBeforeOpen: null,

  /**
   * A callback function that will be called before close.
   * @type {Function}
   */
  onBeforeClose: null,

  /**
   * A callback function that will be called before grab.
   * @type {Function}
   */
  onBeforeGrab: null,

  /**
   * A callback function that will be called before move.
   * @type {Function}
   */
  onBeforeMove: null,

  /**
   * A callback function that will be called before release.
   * @type {Function}
   */
  onBeforeRelease: null
};

var style = {
  target: {
    close: null,
    open: null
  },
  overlay: {
    init: {
      zIndex: 998,
      backgroundColor: options.bgColor,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
      transition: 'opacity\n        ' + options.transitionDuration + 's\n        ' + options.transitionTimingFunction
    }
  },
  cursor: {
    default: 'auto',
    zoomIn: webkitPrefix + 'zoom-in',
    zoomOut: webkitPrefix + 'zoom-out',
    grab: webkitPrefix + 'grab',
    move: 'move'
  }
};

var sniffTransition = function sniffTransition(el) {
  var ret = {};
  var trans = ['webkitTransition', 'mozTransition', 'oTransition', 'msTransition', 'transition'];
  var tform = ['webkitTransform', 'mozTransform', 'oTransform', 'msTransform', 'transform'];
  var end = {
    webkitTransition: 'webkitTransitionEnd',
    mozTransition: 'transitionend',
    oTransition: 'oTransitionEnd otransitionend',
    msTransition: 'msTransitionEnd',
    transition: 'transitionend'
  };

  trans.some(function (prop) {
    if (el.style[prop] !== undefined) {
      ret.transitionProp = prop;
      ret.transEndEvent = end[prop];
      return true;
    }
  });

  tform.some(function (prop) {
    if (el.style[prop] !== undefined) {
      ret.transformProp = prop;
      ret.transformCssProp = prop.replace(/(.*)Transform/, '-$1-transform');
      return true;
    }
  });

  return ret;
};

var checkTrans = function checkTrans(transitionProp, transformProp) {
  return function setStyle(el, styles, remember) {
    var value = void 0;
    if (styles.transition) {
      value = styles.transition;
      delete styles.transition;
      styles[transitionProp] = value;
    }
    if (styles.transform) {
      value = styles.transform;
      delete styles.transform;
      styles[transformProp] = value;
    }

    var s = el.style;
    var original = {};

    for (var key in styles) {
      if (remember) original[key] = s[key] || '';
      s[key] = styles[key];
    }

    return original;
  };
};

var calculateTranslate = function calculateTranslate(rect) {
  var windowCenter = getWindowCenter();
  var targetCenter = {
    x: rect.left + half(rect.width),
    y: rect.top + half(rect.height)
  };

  // The vector to translate image to the window center
  return {
    x: windowCenter.x - targetCenter.x,
    y: windowCenter.y - targetCenter.y
  };
};

var calculateScale = function calculateScale(rect, scaleBase, windowCenter) {
  var targetHalfWidth = half(rect.width);
  var targetHalfHeight = half(rect.height);

  // The distance between target edge and window edge
  var targetEdgeToWindowEdge = {
    x: windowCenter.x - targetHalfWidth,
    y: windowCenter.y - targetHalfHeight
  };

  var scaleHorizontally = targetEdgeToWindowEdge.x / targetHalfWidth;
  var scaleVertically = targetEdgeToWindowEdge.y / targetHalfHeight;

  // The additional scale is based on the smaller value of
  // scaling horizontally and scaling vertically
  return scaleBase + Math.min(scaleHorizontally, scaleVertically);
};

var TOUCH_SCALE_FACTOR = 2;

var processTouches = function processTouches(touches, cb) {
  var total = touches.length;
  var firstTouch = touches[0];
  var multitouch = total > 1;

  var scaleExtra = options.scaleExtra;
  var i = touches.length;
  var xs = 0,
      ys = 0;

  // keep track of the min and max of touch positions

  var min = { x: firstTouch.clientX, y: firstTouch.clientY };
  var max = { x: firstTouch.clientX, y: firstTouch.clientY };

  while (i--) {
    var t = touches[i];
    var _ref = [t.clientX, t.clientY],
        x = _ref[0],
        y = _ref[1];

    xs += x;
    ys += y;

    if (!multitouch) continue;

    if (x < min.x) {
      min.x = x;
    } else if (x > max.x) {
      max.x = x;
    }

    if (y < min.y) {
      min.y = y;
    } else if (y > max.y) {
      max.y = y;
    }
  }

  if (multitouch) {
    // change scaleExtra dynamically
    var distX = max.x - min.x,
        distY = max.y - min.y;


    if (distX > distY) {
      scaleExtra = distX / window.innerWidth * TOUCH_SCALE_FACTOR;
    } else {
      scaleExtra = distY / window.innerHeight * TOUCH_SCALE_FACTOR;
    }
  }

  cb(xs / total, ys / total, scaleExtra);
};

var _this = undefined;

var PRESS_DELAY = 200;
var EVENT_TYPES_GRAB = ['mousedown', 'mousemove', 'mouseup', 'touchstart', 'touchmove', 'touchend'];

// elements
var body = document.body;
var overlay = document.createElement('div');
var target = void 0;
var parent = void 0;

var isIE = detectIE();

// state
var shown = false; // target is open
var lock = false; // target is in transform
var released = true; // mouse/finger is not pressing down
var lastScrollPosition = null;
var translate = void 0;
var scale = void 0;
var srcThumbnail = void 0;
var pressTimer = void 0;

var trans = sniffTransition(overlay);
var transformCssProp = trans.transformCssProp;
var transEndEvent = trans.transEndEvent;
var setStyleHelper = checkTrans(trans.transitionProp, trans.transformProp);

var setStyle$1 = function setStyle$1(el, styles, remember) {
  return setStyleHelper(el, styles, remember);
};

var eventHandler = {

  click: function click(e) {
    e.preventDefault();

    if (shown) {
      if (released) api.close();else api.release();
    } else {
      api.open(e.target);
    }
  },

  scroll: function scroll() {
    var st = scrollTop();

    if (lastScrollPosition === null) {
      lastScrollPosition = st;
    }

    var deltaY = lastScrollPosition - st;

    if (Math.abs(deltaY) >= options.scrollThreshold) {
      lastScrollPosition = null;
      api.close();
    }
  },

  keydown: function keydown(e) {
    var code = e.key || e.code;
    if (code === 'Escape' || e.keyCode === 27) {
      if (released) api.close();else api.release(function () {
        return api.close();
      });
    }
  },

  mousedown: function mousedown(e) {
    if (e.button !== 0) return;
    e.preventDefault();

    pressTimer = setTimeout(function () {
      api.grab(e.clientX, e.clientY);
    }, PRESS_DELAY);
  },

  mousemove: function mousemove(e) {
    if (released) return;
    api.move(e.clientX, e.clientY);
  },

  mouseup: function mouseup(e) {
    if (e.button !== 0) return;
    clearTimeout(pressTimer);

    if (released) api.close();else api.release();
  },

  touchstart: function touchstart(e) {
    e.preventDefault();

    pressTimer = setTimeout(function () {
      processTouches(e.touches, function (x, y, scaleExtra) {
        api.grab(x, y, scaleExtra);
      });
    }, PRESS_DELAY);
  },

  touchmove: function touchmove(e) {
    if (released) return;

    processTouches(e.touches, function (x, y, scaleExtra) {
      api.move(x, y, scaleExtra);
    });
  },

  touchend: function touchend(e) {
    if (e.targetTouches.length > 0) return;
    clearTimeout(pressTimer);

    if (released) api.close();else api.release();
  }
};

var kabeCaseMap = {
  'bgOpacity': 'bg-opacity'
};

var kabeCase = function kabeCase(str) {
  if (str in kabeCaseMap) return kabeCaseMap[str];

  return str;
};

/**
 * Zooming methods.
 * @type {Object}
 */
var api = {

  /**
   * Make element(s) zoomable.
   * @param  {string|Element} el A css selector or an Element.
   * @return {api}
   */
  listen: function listen(el, delegated) {
    if (delegated) {
      on(el, 'click', delegated, eventHandler.click);
    }

    if (typeof el === 'string') {
      var els = document.querySelectorAll(el),
          i = els.length;

      while (i--) {
        api.listen(els[i]);
      }

      return _this;
    }

    if (el.tagName !== 'IMG') return;

    el.style.cursor = style.cursor.zoomIn;

    el.addEventListener('click', eventHandler.click);

    if (options.preloadImage && el.hasAttribute('data-original')) {
      loadImage(el.getAttribute('data-original'));
    }

    return _this;
  },

  /**
   * Open (zoom in) the Element.
   * @param  {Element} el The Element to open.
   * @param  {Function} [cb=options.onOpen] A callback function that will be
   * called when a target is opened and transition has ended. It will get
   * the target element as the argument.
   * @return {api}
   */
  open: function open(el) {
    var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.onOpen;

    if (shown || lock) return;

    target = typeof el === 'string' ? document.querySelector(el) : el;

    if (target.tagName !== 'IMG') return;

    var csutomOptions = Object.assign(options);

    var overrideOption = ['bgOpacity' /*, scaleBase, duration */];
    overrideOption.forEach(function (optKey) {
      var value = null;
      if ((value = target.getAttribute('data-' + kabeCase(optKey))) != null) {
        csutomOptions[optKey] = value;
      }
    });

    var windowCenter = getWindowCenter();
    // custom scale window
    if (target.hasAttribute('data-width') && target.hasAttribute('data-height')) {
      windowCenter.x = Math.min(windowCenter.x, target.getAttribute('data-width') / 2);
      windowCenter.y = Math.min(windowCenter.y, target.getAttribute('data-height') / 2);
    }

    // onBeforeOpen event
    if (csutomOptions.onBeforeOpen) csutomOptions.onBeforeOpen(target);

    shown = true;
    lock = true;
    parent = target.parentNode;

    // load hi-res image if preloadImage option is disabled
    if (!csutomOptions.preloadImage && target.hasAttribute('data-original')) {
      loadImage(target.getAttribute('data-original'));
    }

    var rect = target.getBoundingClientRect();
    translate = calculateTranslate(rect);
    scale = calculateScale(rect, csutomOptions.scaleBase, windowCenter);

    // force layout update
    target.offsetWidth;

    var originalStyle = window.getComputedStyle(target);
    style.target.open = {
      position: originalStyle.position && originalStyle.position !== 'static' ? originalStyle.position : 'relative',
      zIndex: 999,
      cursor: csutomOptions.enableGrab ? style.cursor.grab : style.cursor.zoomOut,
      transition: transformCssProp + '\n        ' + csutomOptions.transitionDuration + 's\n        ' + csutomOptions.transitionTimingFunction,
      transform: 'translate(' + translate.x + 'px, ' + translate.y + 'px) ' + (isIE ? '' : 'translateZ(0)') + ' scale(' + scale + ')'
    };

    // trigger transition
    style.target.close = setStyle$1(target, style.target.open, true);

    // insert overlay
    parent.appendChild(overlay);
    setTimeout(function () {
      return overlay.style.opacity = csutomOptions.bgOpacity;
    }, 30);

    document.addEventListener('scroll', eventHandler.scroll);
    document.addEventListener('keydown', eventHandler.keydown);
    var onEnd = function onEnd() {
      target.classList.add('is-zoomed');

      target.removeEventListener(transEndEvent, onEnd);

      lock = false;

      if (csutomOptions.enableGrab) {
        toggleListeners(document, EVENT_TYPES_GRAB, eventHandler, true);
      }

      if (target.hasAttribute('data-original')) {
        (function () {
          srcThumbnail = target.getAttribute('src');
          var dataOriginal = target.getAttribute('data-original');
          var temp = target.cloneNode(false);

          // force compute the hi-res image in DOM to prevent
          // image flickering while updating src
          temp.setAttribute('src', dataOriginal);
          temp.style.position = 'fixed';
          temp.style.visibility = 'hidden';
          body.appendChild(temp);

          setTimeout(function () {
            target.setAttribute('src', dataOriginal);
            body.removeChild(temp);
          }, 10);
        })();
      }

      if (cb) cb(target);
    };

    if (transEndEvent) {
      target.addEventListener(transEndEvent, onEnd);
    } else {
      onEnd();
    }

    return _this;
  },

  /**
   * Close (zoom out) the Element currently opened.
   * @param  {Function} [cb=options.onClose] A callback function that will be
   * called when a target is closed and transition has ended. It will get
   * the target element as the argument.
   * @return {api}
   */
  close: function close() {
    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.onClose;

    if (!shown || lock) return;

    // onBeforeClose event
    if (options.onBeforeClose) options.onBeforeClose(target);

    lock = true;

    // force layout update
    target.offsetWidth;

    body.style.cursor = style.cursor.default;
    overlay.style.opacity = 0;
    setStyle$1(target, { transform: 'none' });

    document.removeEventListener('scroll', eventHandler.scroll);
    document.removeEventListener('keydown', eventHandler.keydown);

    var onEnd = function onEnd() {
      target.classList.remove('is-zoomed');
      target.removeEventListener(transEndEvent, onEnd);

      shown = false;
      lock = false;

      if (options.enableGrab) {
        toggleListeners(document, EVENT_TYPES_GRAB, eventHandler, false);
      }

      if (target.hasAttribute('data-original')) {
        // downgrade source
        target.setAttribute('src', srcThumbnail);
      }

      // trigger transition
      setStyle$1(target, style.target.close);

      // remove overlay
      parent.removeChild(overlay);

      if (cb) cb(target);
    };

    if (transEndEvent) {
      target.addEventListener(transEndEvent, onEnd);
    } else {
      onEnd();
    }

    return _this;
  },

  /**
   * Grab the Element currently opened given a position and apply extra zoom-in.
   * @param  {number}   x The X-axis of where the press happened.
   * @param  {number}   y The Y-axis of where the press happened.
   * @param  {number}   scaleExtra Extra zoom-in to apply.
   * @param  {Function} [cb=options.scaleExtra] A callback function that will be
   * called when a target is grabbed and transition has ended. It will get
   * the target element as the argument.
   * @return {api}
   */
  grab: function grab(x, y) {
    var scaleExtra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : options.scaleExtra;
    var cb = arguments[3];

    if (!shown || lock) return;

    // onBeforeGrab event
    if (options.onBeforeGrab) options.onBeforeGrab(target);

    released = false;

    var windowCenter = getWindowCenter();
    var dx = windowCenter.x - x,
        dy = windowCenter.y - y;


    setStyle$1(target, {
      cursor: style.cursor.move,
      transform: 'translate(' + (translate.x + dx) + 'px, ' + (translate.y + dy) + 'px)\n        scale(' + (scale + scaleExtra) + ')'
    });

    target.addEventListener(transEndEvent, function onEnd() {
      target.removeEventListener(transEndEvent, onEnd);
      if (cb) cb(target);
    });
  },

  /**
   * Move the Element currently grabbed given a position and apply extra zoom-in.
   * @param  {number}   x The X-axis of where the press happened.
   * @param  {number}   y The Y-axis of where the press happened.
   * @param  {number}   scaleExtra Extra zoom-in to apply.
   * @param  {Function} [cb=options.scaleExtra] A callback function that will be
   * called when a target is moved and transition has ended. It will get
   * the target element as the argument.
   * @return {api}
   */
  move: function move(x, y) {
    var scaleExtra = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : options.scaleExtra;
    var cb = arguments[3];

    if (!shown || lock) return;

    // onBeforeMove event
    if (options.onBeforeMove) options.onBeforeMove(target);

    released = false;

    var windowCenter = getWindowCenter();
    var dx = windowCenter.x - x,
        dy = windowCenter.y - y;


    setStyle$1(target, {
      transition: transformCssProp,
      transform: 'translate(' + (translate.x + dx) + 'px, ' + (translate.y + dy) + 'px)\n        scale(' + (scale + scaleExtra) + ')'
    });

    body.style.cursor = style.cursor.move;

    target.addEventListener(transEndEvent, function onEnd() {
      target.removeEventListener(transEndEvent, onEnd);
      if (cb) cb(target);
    });
  },

  /**
   * Release the Element currently grabbed.
   * @param  {Function} [cb=options.onRelease] A callback function that will be
   * called when a target is released and transition has ended. It will get
   * the target element as the argument.
   * @return {api}
   */
  release: function release() {
    var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.onRelease;

    if (!shown || lock) return;

    // onBeforeRelease event
    if (options.onBeforeRelease) options.onBeforeRelease(target);

    lock = true;

    setStyle$1(target, style.target.open);
    body.style.cursor = style.cursor.default;

    target.addEventListener(transEndEvent, function onEnd() {
      target.removeEventListener(transEndEvent, onEnd);

      lock = false;
      released = true;

      if (cb) cb(target);
    });

    return _this;
  },

  /**
   * Update options.
   * @param  {Object} opts An Object that contains options.
   * @return {api}
   */
  config: function config(opts) {
    if (!opts) return options;

    for (var key in opts) {
      options[key] = opts[key];
    }

    setStyle$1(overlay, {
      backgroundColor: options.bgColor,
      transition: 'opacity\n        ' + options.transitionDuration + 's\n        ' + options.transitionTimingFunction
    });

    return _this;
  }
};

// Init ------------------------------------------------------------------------

setStyle$1(overlay, style.overlay.init);
overlay.setAttribute('id', 'zoom-overlay');
overlay.addEventListener('click', function () {
  return api.close();
});
document.addEventListener('DOMContentLoaded', function () {
  api.listen(options.defaultZoomable);
});

return api;

})));
//# sourceMappingURL=zooming.js.map
