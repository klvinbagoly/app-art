const app = {
  canvas: null,
  context: null,
  canvasRect: null,

  preview: null,
  previewCtx: null,
  previewPath: null,
  startingPoint: [0, 0],
  drawMode: 'free',

  color: 'black',
  width: 8,
  active: false,
  fillMode: false,
  x: 0,
  y: 0,
  init() {
    this.canvas = document.querySelector('#myCanvas')
    this.context = this.canvas.getContext('2d')
    this.canvasRect = this.canvas.getClientRects()[0]
    this.getCanvasSize()

    this.preview = document.querySelector('#preview')
    this.previewCtx = this.preview.getContext('2d')
    this.preview.style.top = parseInt(this.canvasRect.top) + 'px'
    this.preview.width = this.canvas.width
    this.preview.height = this.canvas.height

    this.context.fillStyle = 'white'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = this.color
    this.context.strokeStyle = this.color
    this.context.lineWidth = this.previewCtx.lineWidth = this.width
    this.context.lineCap = this.previewCtx.lineCap = 'round'
    this.context.lineJoin = this.previewCtx.lineJoin = 'round'

    this.canvas.addEventListener('mousedown', this.beginLine.bind(this))
    this.canvas.addEventListener('mousemove', this.drawLine.bind(this))
    this.canvas.addEventListener('mouseup', () => {
      this.active = false
      if (this.fillMode) this.context.fill()
    })

    window.addEventListener('resize', this.getCanvasSize.bind(this))
    window.addEventListener('scroll', () => {
      this.canvasRect = this.canvas.getClientRects()[0]
      this.preview.width = this.canvas.width
      this.preview.height = this.canvas.height
    })

    this.setControls()

    this.preview.addEventListener('mousedown', this.beginShape.bind(this))
    this.preview.addEventListener('mousemove', this.drawShape.bind(this))
    this.preview.addEventListener('mouseup', this.finalizeShape.bind(this))
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

  beginShape(ev) {
    this.active = true
    this.getCanvasCoordinates(ev)
    this.startingPoint = [this.x, this.y]
  },

  drawShape(ev) {
    if (!this.active) return
    let radius
    this.getCanvasCoordinates(ev)
    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height)
    this.previewPath = new Path2D()
    switch (this.drawMode) {
      case 'straightLine':
        this.previewPath.moveTo(this.startingPoint[0], this.startingPoint[1])
        this.previewPath.lineTo(this.x, this.y)
        this.previewCtx.stroke(this.previewPath)
        break;
      case 'rect':
        this.previewPath.rect(this.startingPoint[0], this.startingPoint[1],
          this.x - this.startingPoint[0], this.y - this.startingPoint[1])
        this.previewCtx.stroke(this.previewPath)
        break;
      case 'circle':
        radius = Math.min(this.x - this.startingPoint[0], this.y - this.startingPoint[1]) / 2
        this.previewPath.arc(this.startingPoint[0] + radius, this.startingPoint[1] + radius,
          radius, 0, Math.PI * 2)
        this.previewCtx.stroke(this.previewPath)
        break;
      case 'circleCenter':
        radius = Math.sqrt(
          (this.x - this.startingPoint[0]) ** 2 + (this.y - this.startingPoint[1]) ** 2
        )
        this.previewPath.arc(this.startingPoint[0], this.startingPoint[1], radius,
          0, Math.PI * 2)
        this.previewCtx.stroke(this.previewPath)
        break;
      default:
        break;
    }
  },

  finalizeShape(ev) {
    this.active = false
    this.previewCtx.clearRect(0, 0, this.preview.width, this.preview.height)
    this.context.stroke(this.previewPath)
    if (this.fillMode) this.context.fill(this.previewPath)
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
    const globalAlpha = document.querySelector('#globalAlpha')
    const shapeButtons = document.querySelectorAll('input[name="brushShape"]')
    const fillModeChecker = document.querySelector('#fillMode')
    const drawModeButtons = document.querySelectorAll('input[name="drawMode"]')

    colorPicker.addEventListener('change', () => {
      this.color = colorPicker.value
      this.context.strokeStyle = this.color
      this.context.fillStyle = this.color
      this.previewCtx.strokeStyle = this.previewCtx.fillStyle = this.color
      widthIndicator.style.borderColor = this.color
    })

    widthSlide.addEventListener('change', () => {
      this.width = widthSlide.value
      this.context.lineWidth = this.width
      this.previewCtx.lineWidth = this.width
      widthIndicator.style.borderWidth = this.width / 2 + 'px'
    })

    deleteBtn.addEventListener('click', () => {
      this.context.fillStyle = 'white'
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)
    })

    globalAlpha.addEventListener('change', () => {
      this.context.globalAlpha = globalAlpha.value
      widthIndicator.style.opacity = globalAlpha.value
    })

    shapeButtons.forEach(button => {
      button.addEventListener('change', () => {
        if (button.checked) {
          if (button.value === 'square') {
            this.context.lineCap = 'square'
            this.context.lineJoin = 'miter'
            widthIndicator.style.borderRadius = '0'
          } else {
            this.context.lineCap = 'round'
            this.context.lineJoin = 'round'
            widthIndicator.style.borderRadius = '100%'
          }
          this.previewCtx.lineCap = this.context.lineCap
          this.previewCtx.lineJoin = this.context.lineJoin
        }
      })
    })

    fillModeChecker.addEventListener('change', () => {
      this.fillMode = fillModeChecker.checked
      if (this.fillMode) this.context.lineWidth = this.previewCtx.lineWidth = widthSlide.value = 1
    })

    drawModeButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.checked) {
          this.drawMode = button.value
        }
        if (['straightLine', 'rect', 'circle', 'circleCenter'].includes(this.drawMode)) {
          this.preview.style.display = 'block'
        } else {
          this.preview.style.display = 'none'
        }
      })
    })
  }
}

window.onload = app.init.bind(app)