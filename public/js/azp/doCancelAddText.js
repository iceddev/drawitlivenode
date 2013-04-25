define([
  './wb/whiteboard',
  'dijit/registry'
], function(whiteboard, registry){

  'use strict';

  return function doCancelAddText(){
    registry.byId('wbText').setValue('');
    registry.byId('textDialog').hide();
    whiteboard.overlayDrawing.clear();
    whiteboard.textPoint = null;
  };

});