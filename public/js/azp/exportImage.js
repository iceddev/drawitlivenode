define([
  'dojo/on',
  'dojo/query',
  'dijit/registry'
], function(on, query, registry){

  'use strict';

  var exportedImg = new Image();

  return function exportImage(){
    if(Modernizr.canvas){
      var imgDialog = registry.byId('imgDialog');
      exportedImg.src = '';
      on(exportedImg, 'load', function(){
        imgDialog.show();
      });
      imgDialog.set('content', exportedImg);
      exportedImg.src = query('canvas', 'applicationArea')[0].toDataURL();
    } else {
      console.log('canvas not supported');
    }
  };

});