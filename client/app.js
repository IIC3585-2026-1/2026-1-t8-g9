const socket = io();
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const clearButton = document.getElementById("clear-button");
const colorPicker = document.getElementById("color-picker");
const brushSizeInput = document.getElementById("brush-size");
const brushSizeValue = document.getElementById("brush-size-value");

let drawing = false;
let previousX = 0;
let previousY = 0;
let currentLineWidth = 3;

function getCanvasPosition(event) {
  const bounds = canvas.getBoundingClientRect();

  return {
    x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
    y: (event.clientY - bounds.top) * (canvas.height / bounds.height)
  };
}

function getTouchCanvasPosition(event) {
  const touch = event.touches[0];
  const bounds = canvas.getBoundingClientRect();

  return {
    x: (touch.clientX - bounds.left) * (canvas.width / bounds.width),
    y: (touch.clientY - bounds.top) * (canvas.height / bounds.height)
  };
}

function drawSegment(stroke) {
  context.beginPath();
  context.moveTo(stroke.x0, stroke.y0);
  context.lineTo(stroke.x1, stroke.y1);
  context.strokeStyle = stroke.color || "#000000";
  context.lineWidth = stroke.lineWidth || 3;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
}

canvas.addEventListener("mousedown", (event) => {
  const position = getCanvasPosition(event);

  drawing = true;
  previousX = position.x;
  previousY = position.y;
});

canvas.addEventListener("mousemove", (event) => {
  if (!drawing) return;

  const position = getCanvasPosition(event);

  const stroke = {
    x0: previousX,
    y0: previousY,
    x1: position.x,
    y1: position.y,
    color: colorPicker.value,
    lineWidth: currentLineWidth
  };

  drawSegment(stroke);
  socket.emit("draw", stroke);

  previousX = position.x;
  previousY = position.y;
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
});

socket.on("draw", (stroke) => {
  drawSegment(stroke);
});

socket.on("canvas-state", (strokes) => {
  strokes.forEach(drawSegment);
});

clearButton.addEventListener("click", () => {
  socket.emit("clear-canvas");
});

socket.on("clear-canvas", () => {
  context.clearRect(0, 0, canvas.width, canvas.height);
});

canvas.addEventListener("touchstart", (event) => {
  event.preventDefault();

  const position = getTouchCanvasPosition(event);

  drawing = true;
  previousX = position.x;
  previousY = position.y;
});

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();

  if (!drawing) return;

  const position = getTouchCanvasPosition(event);

  const stroke = {
    x0: previousX,
    y0: previousY,
    x1: position.x,
    y1: position.y,
    color: colorPicker.value,
    lineWidth: currentLineWidth
  };

  drawSegment(stroke);
  socket.emit("draw", stroke);

  previousX = position.x;
  previousY = position.y;
});

canvas.addEventListener("touchend", (event) => {
  event.preventDefault();
  drawing = false;
});

canvas.addEventListener("touchcancel", (event) => {
  event.preventDefault();
  drawing = false;
});

window.addEventListener("mouseup", () => {
  drawing = false;
});

brushSizeInput.addEventListener("input", () => {
  currentLineWidth = Number(brushSizeInput.value);
  brushSizeValue.textContent = currentLineWidth;
});