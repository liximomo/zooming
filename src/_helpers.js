const body = document.body
const docElm = document.documentElement
const webkitPrefix = 'WebkitAppearance' in document.documentElement.style
  ? '-webkit-'
  : ''

function on(elSelector, eventName, selector, handler, useCapture) {
  const _useCapture = useCapture === undefined ? false : useCapture
  let elements = null
  if (typeof elSelector === 'string') {
    elements = document.querySelectorAll(elSelector)
  } else {
    elements = [].concat(elSelector)
  }
  const addEventListener = function(element) {
    element.addEventListener(eventName, function(e) {
      for (let target = e.target; target && target !== this; target = target.parentNode) {
        // loop parent nodes from the target to the delegation node
        let match = false
        if (target.matches) {
          match = target.matches(selector)
        } else if (target.webkitMatchesSelector) {
          match = target.webkitMatchesSelector(selector)
        } else if (target.mozMatchesSelector) {
          match = target.mozMatchesSelector(selector)
        } else if (target.msMatchesSelector) {
          match = target.msMatchesSelector(selector)
        } else if (target.oMatchesSelector) {
          match = target.oMatchesSelector(selector)
        }
        if (match) {
          handler.call(target, e)
          break
        }
      }
    }, _useCapture)
  }
  Array.prototype.forEach.call(elements, addEventListener)
}

const divide = (denominator) => {
  return (numerator) => {
    return numerator / denominator
  }
}

const half = divide(2)

const loadImage = (url, cb) => {
  const img = new Image()
  img.onload = () => {
    if (cb) cb(img)
  }
  img.src = url
}

const scrollTop = () => {
  return window.pageYOffset ||
    (docElm || body.parentNode || body).scrollTop
}

const getWindowCenter = () => {
  const docWidth = docElm.clientWidth || body.clientWidth
  const docHeight = docElm.clientHeight || body.clientHeight

  return {
    x: half(docWidth),
    y: half(docHeight)
  }
}

const toggleListeners = (el, types, handler, add = true) => {
  types.forEach(t => {
    if (add) {
      el.addEventListener(t, handler[t])
    } else {
      el.removeEventListener(t, handler[t])
    }
  })
}

const detectIE = () => {
  const ua = window.navigator.userAgent

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  
  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  
  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
  
  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  const msie = ua.indexOf('MSIE ')
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10)
  }

  const trident = ua.indexOf('Trident/')
  if (trident > 0) {
    // IE 11 => return version number
    const rv = ua.indexOf('rv:')
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10)
  }

  const edge = ua.indexOf('Edge/')
  if (edge > 0) {
    // Edge (IE 12+) => return version number
    return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10)
  }

  // other browser
  return false
} 


export {
  detectIE,
  webkitPrefix,
  half,
  loadImage,
  scrollTop,
  getWindowCenter,
  toggleListeners,
  on
}
