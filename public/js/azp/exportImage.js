define([
  'dojo/on',
  'dijit/registry'
], function(on, registry){

  'use strict';

  var exportedImg = new Image();

  return function exportImage(canvas){
    if(Modernizr.canvas){
      var imgDialog = registry.byId('imgDialog');
      exportedImg.src = '';
      on(exportedImg, 'load', function(){
        imgDialog.show();
      });
      imgDialog.set('content', exportedImg);
      exportedImg.src = canvas.toDataURL();
    } else {
      console.log('canvas not supported');
    }
  };

});