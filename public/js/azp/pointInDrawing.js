define([
  './wb/whiteboard'
], function(whiteboard){

  'use strict';

  return function pointInDrawing(pt){
    if((pt.x > -2) && (pt.x < (whiteboard.width + 2)) && (pt.y > -2) && (pt.y < (whiteboard.height + 2))){
      return true;
    }else{
      return false;
    }
  };

});