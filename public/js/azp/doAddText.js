define([
  './drawFromJson',
  './sendMessage',
  './wb/create-json',
  './wb/whiteboard',
  'dijit/registry'
], function(drawFromJSON, sendMessage, createGeom, whiteboard, registry){

  'use strict';

  return function doAddText(){
    var text = registry.byId('wbText').getValue();
    if((text != '') && (whiteboard.textPoint)){
      registry.byId('textDialog').hide();
      var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
      drawFromJSON(geom,whiteboard.drawing);
      whiteboard.textPoint = null;
      sendMessage({geometry:geom});
    }
    whiteboard.overlayDrawing.clear();
  };

});