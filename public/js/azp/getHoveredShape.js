define([
  './ptInBox'
], function(ptInBox){

  'use strict';

  return function getHoveredShape(drawing, pt){
    try{
      var children = drawing.children;
      if(children){
        for(var i = children.length; i > 0; i--){
          var child = children[i - 1];
          if(ptInBox(pt, child.wbbb)){
            return child;
          }
        }
      }
    }catch(e){
      console.log('error finding shape',e);
    }

    return null;
  };

});