function Makimono(opts) {
  opts = opts == null ? {} : opts

  /* parameters */
  this.left = opts.left == null ? - Infinity : opts.left
  this.right = opts.right == null ? Infinity : opts.right
  this.top = opts.top == null ? - Infinity : opts.top
  this.bottom = opts.bottom == null ? Infinity : opts.bottom
  this.distort = .85
  this.releaseSlip = 10
  this.pressSlip = 1
  this.bounce = .1
  this.fps = 60

  /* states */
  this._isMouseDown = false
  this._prevMouseX = 0
  this._prevMouseY = 0
  this._targetX = 0
  this._targetY = 0
  this._x = 0
  this._y = 0
  this._prevX = 0
  this._prevY = 0
  this._time = 0
  this._isRunning = false

  /* bound callbacks */
  this.onMouseDown = this._onMouseDown.bind(this)
  this.onMouseUp = this._onMouseUp.bind(this)
  this.onMouseMove = this._onMouseMove.bind(this)
  this.onTouchStart = this._onTouchStart.bind(this)
  this.onTouchEnd = this._onTouchEnd.bind(this)
  this.onTouchMove = this._onTouchMove.bind(this)
}

Makimono.prototype = {
  _isInRegionX: function(x) {
    if(x < this.left) {
      return false
    }
    if(x > this.right) {
      return false
    }
    return true
  },

  _isInRegionY: function(y) {
    if(y < this.top) {
      return false
    }
    if(y > this.bottom) {
      return false
    }
    return true
  },

  _clampedX: function(x) {
    if(x < this.left) {
      return this.left
    }
    if(x > this.right) {
      return this.right
    }
    return x
  },

  _clampedY: function(y){
    if(y < this.top) {
      return this.top
    }
    if(y > this.bottom) {
      return this.bottom
    }
    return y
  },

  getPosition: function() {
    var x = this._x
    var y = this._y
    if(x < this.left) {
      x = this.left - Math.pow(this.left - x, this.distort)
    }
    if(x > this.right) {
      x = this.right + Math.pow(x - this.right, this.distort)
    }
    if(y < this.top) {
      y = this.top - Math.pow(this.top - y, this.distort)
    }
    if(y > this.bottom) {
      y = this.bottom + Math.pow(y - this.bottom, this.distort)
    }
    return {x: -x, y: -y}
  },

  bindEvents: function(dom) {
    dom.addEventListener("mousedown", this.onMouseDown)
    dom.addEventListener("mouseup", this.onMouseUp)
    dom.addEventListener("mousemove", this.onMouseMove)
    dom.addEventListener("touchstart", this.onTouchStart)
    dom.addEventListener("touchend", this.onTouchEnd)
    dom.addEventListener("touchmove", this.onTouchMove)
  },

  unbindEvents: function(dom) {
    dom.removeEventListener("mousedown", this.onMouseDown)
    dom.removeEventListener("mouseup", this.onMouseUp)
    dom.removeEventListener("mousemove", this.onMouseMove)
    dom.removeEventListener("touchstart", this.onTouchStart)
    dom.removeEventListener("touchend", this.onTouchEnd)
    dom.removeEventListener("touchmove", this.onTouchMove)
  },

  update: function(time) {
    while(this._time < time) {
      this._time += 1000 / this.fps
      this._step()
    }
  },

  addDeltaConstantly: function(x, y) {
    this._targetX = this._clampedX(this._targetX + x)
    this._targetY = this._clampedY(this._targetY - y)
    this._x = this._targetX
    this._y = this._targetY
  },

  _step: function() {
    this._prevX = this._x
    this._prevY = this._y

    var pX = 0
    var pY = 0

    if(this._isMouseDown) {
      pX = 1 / (this.pressSlip + 1)
      pY = 1 / (this.pressSlip + 1)
    } else {
      if(this._isInRegionX(this._x)) {
        pX = 1 / (this.releaseSlip + 1)
      } else {
        pX = this.bounce
        this._targetX = this._clampedX(this._x)
      }
      if(this._isInRegionY(this._y)) {
        pY = 1 / (this.releaseSlip + 1)
      } else {
        pY = this.bounce
        this._targetY = this._clampedY(this._y)
      }
    }

    this._x += (this._targetX - this._x) * pX
    this._y += (this._targetY - this._y) * pY
  },

  _onMouseMove: function(e) {
    if(!this._isMouseDown) {
      return
    }
    this._isMouseDown = true
    this._targetX -= e.clientX - this._prevMouseX
    this._targetY -= e.clientY - this._prevMouseY
    this._prevMouseX = e.clientX
    this._prevMouseY = e.clientY
  },

  _onMouseDown: function(e) {
    this._isMouseDown = true
    this._prevMouseX = e.clientX
    this._prevMouseY = e.clientY

    this._targetX = this._x + (this._x - this._prevX) * this.pressSlip
    this._targetY = this._y + (this._y - this._prevY) * this.pressSlip
  },

  _onMouseUp: function(e) {
    this._isMouseDown = false

    this._targetX += (this._x - this._prevX) * this.releaseSlip
    this._targetY += (this._y - this._prevY) * this.releaseSlip
  },

  _onTouchStart: function(e) {
    this._onMouseDown(e.touches[0])
  },

  _onTouchEnd: function(e) {
    this._onMouseUp(e)
  },

  _onTouchMove: function(e) {
    this._onMouseMove(e.touches[0])
  }
}

module.exports = Makimono
