define([
  './drawFromJson',
  './sendMessage',
  './wb/whiteboard',
  'dijit/registry',
  'dijit/popup'
], function(drawFromJSON, sendMessage, whiteboard, registry, popup){

  'use strict';

  return function onClearDrawing(){
    popup.close(registry.byId("clearDrawingDialog"));
    // var geom = createClearDrawingJSON();
    var geom = [];
    sendMessage({geometry: geom });
    drawFromJSON(geom, whiteboard.drawing);
  };

});