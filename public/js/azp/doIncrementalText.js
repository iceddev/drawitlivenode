define([
  './drawFromJson',
  './wb/create-json',
  './wb/whiteboard',
  'dijit/registry'
], function(drawFromJSON, createGeom, whiteboard, registry){

  'use strict';

  return function doIncrementalText(){
    whiteboard.overlayDrawing.clear();
    var text = registry.byId('wbText').getValue();
    if((text != '') && (whiteboard.textPoint)){
      var geom = createGeom.text(whiteboard.textPoint, text, whiteboard.fontSize, whiteboard.lineColor);
      drawFromJSON(geom, whiteboard.overlayDrawing);
    }
  };

});