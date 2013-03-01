//whiteboard global state

define({
  width : 700,
  height : 400,
  container : null,
  drawing: null,
  overlayContainer : null,
  overlayDrawing: null,
  lineColor : "#000000",
  fillColor : "#FFFFFF",
  lineStroke : 3,
  fontSize : 12,
  pingInterval : 180000,
  userCheckInterval : 600000,
  tool : 'pen',
  points : [],
  mouseDown : false
});