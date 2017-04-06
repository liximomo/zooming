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

export {
  webkitPrefix,
  half,
  loadImage,
  scrollTop,
  getWindowCenter,
  toggleListeners,
  on
}
