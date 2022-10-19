const app = {
  canvas: null,
  context: null,
  canvasRect: null,
  color: 'black',
  width: 8,
  active: false,
  x: 0,
  y: 0,
  init() {
    this.canvas = document.querySelector('#myCanvas')
    this.context = this.canvas.getContext('2d')
    this.canvasRect = this.canvas.getClientRects()[0]
    this.getCanvasSize()
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.width

    this.canvas.addEventListener('mousedown', this.beginLine.bind(this))
    this.canvas.addEventListener('mousemove', this.drawLine.bind(this))
    this.canvas.addEventListener('mouseup', () => {
      this.active = false
    })

    window.addEventListener('resize', this.getCanvasSize.bind(this))
    window.addEventListener('scroll', () => {
      this.canvasRect = this.canvas.getClientRects()[0]
    })

    this.setControls()
  },

  beginLine(ev) {
    this.active = true
    this.context.beginPath()
    this.getCanvasCoordinates(ev)
    this.context.moveTo(this.x, this.y)
  },

  drawLine(ev) {
    if (!this.active) return
    this.getCanvasCoordinates(ev)
    this.context.lineTo(this.x, this.y)
    this.context.stroke()
  },

  getCanvasCoordinates(ev) {
    this.x = (ev.clientX - this.canvasRect.x - this.canvas.clientLeft)
    this.y = (ev.clientY - this.canvasRect.y - this.canvas.clientTop)
  },

  getCanvasSize() {
    const style = window.getComputedStyle(this.canvas)
    const { width, height } = style
    this.canvas.width = parseInt(width)
    this.canvas.height = parseInt(height)

    this.canvasRect = this.canvas.getClientRects()[0]
  },

  setControls() {
    const colorPicker = document.querySelector('#brushColor')
    const widthSlide = document.querySelector('#brushWidth')
    const widthIndicator = document.querySelector('.width-indicator')
    const deleteBtn = document.querySelector('.delete-btn')

    colorPicker.addEventListener('change', () => {
      this.color = colorPicker.value
      this.context.strokeStyle = this.color
      widthIndicator.style.borderColor = this.color
    })

    widthSlide.addEventListener('change', () => {
      this.width = widthSlide.value
      this.context.lineWidth = this.width
      widthIndicator.style.borderWidth = this.width / 2 + 'px'
    })

    deleteBtn.addEventListener('click', () => {
      this.context.fillStyle = 'white'
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    })
  }
}

window.onload = app.init.bind(app)