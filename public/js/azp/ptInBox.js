define(function(){

  'use strict';

  return function ptInBox(pt, box){
    if(pt && box){
      if((pt.x >= box.x1) && (pt.x <= box.x2) && (pt.y >= box.y1) && (pt.y <= box.y2)){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  };

});