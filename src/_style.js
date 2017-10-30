import { webkitPrefix } from './_helpers'
import options from './_options'

export default {
  target: {
    close: null,
    open: null,
  },
  overlay: {
    init: {
      zIndex: options.zIndex,
      backgroundColor: options.bgColor,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0,
      transition: `opacity
        ${options.transitionDuration}s
        ${options.transitionTimingFunction}`,
    },
  },
  cursor: {
    default: 'auto',
    zoomIn: `${webkitPrefix}zoom-in`,
    zoomOut: `${webkitPrefix}zoom-out`,
    grab: `${webkitPrefix}grab`,
    move: 'move',
  },
}
