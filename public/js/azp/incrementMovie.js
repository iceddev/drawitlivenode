define([
  './drawFromJson',
  './wb/whiteboard',
  'put',
  'dijit/registry'
], function(drawFromJSON, whiteboard, put, registry){

  'use strict';

  return function incrementMovie(){
    var indexEnd = Math.round(registry.byId('movieSlider').getValue());
    whiteboard.movieDrawing.clear();
    for(var i =0; i < indexEnd; i++){
      drawFromJSON(whiteboard.geomMessageList[i].geometry, whiteboard.movieDrawing);
    }
    if(indexEnd > 0){
      dom.byId('movieUser').innerHTML = 'User: ' + whiteboard.geomMessageList[indexEnd - 1].fromUser;
    }
  };

});