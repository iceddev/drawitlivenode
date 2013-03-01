define([
  './whiteboard',
  'dojo/_base/html'
], function(whiteboard, html){

  function getGfxMouse(evt){
      var coordsM = html.coords(whiteboard.container);
      return {x: Math.round(evt.clientX - coordsM.x), y: Math.round(evt.clientY - coordsM.y)};
  }

  return getGfxMouse;
});