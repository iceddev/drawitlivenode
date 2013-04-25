define([
  './wb/whiteboard',
  'dojo/dom-geometry'
], function(whiteboard, domGeom){

  return function getGfxMouse(evt){
    var coordsM = domGeom.position(whiteboard.container);
    return {x: Math.round(evt.clientX - coordsM.x), y: Math.round(evt.clientY - coordsM.y)};
  };

});